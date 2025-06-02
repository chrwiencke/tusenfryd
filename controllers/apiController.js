const Attraction = require('../models/Attraction');
const Reservation = require('../models/Reservation');
const ParkSetting = require('../models/ParkSetting');

// Get all attractions
const getAttractions = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;

    const attractions = await Attraction.find(query).sort({ name: 1 });

    // Update wait times
    for (let attraction of attractions) {
      attraction.waitTime = attraction.calculateWaitTime();
      await attraction.save();
    }

    res.json({
      success: true,
      data: attractions
    });
  } catch (error) {
    next(error);
  }
};

// Get single attraction
const getAttractionById = async (req, res, next) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    // Update wait time
    attraction.waitTime = attraction.calculateWaitTime();
    await attraction.save();

    // Get queue count
    const queueCount = await Reservation.countDocuments({
      attraction: attraction._id,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        attraction,
        queueCount
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create attraction (admin only)
const createAttraction = async (req, res, next) => {
  try {
    const attraction = new Attraction(req.body);
    await attraction.save();

    res.status(201).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

// Update attraction (admin only)
const updateAttraction = async (req, res, next) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    res.json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

// Delete attraction (admin only)
const deleteAttraction = async (req, res, next) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    // Cancel all active reservations for this attraction
    await Reservation.updateMany(
      { attraction: req.params.id, status: 'active' },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Attraction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Create reservation
const createReservation = async (req, res, next) => {
  try {
    const attraction = await Attraction.findById(req.body.attraction);
    
    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    if (attraction.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'Attraction is not currently open for reservations'
      });
    }

    const reservation = new Reservation(req.body);
    await reservation.save();
    await reservation.populate('attraction');

    // Update attraction queue count
    attraction.currentQueue += parseInt(req.body.numberOfGuests);
    await attraction.save();

    res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

// Get reservations
const getReservations = async (req, res, next) => {
  try {
    const { email, status, attraction } = req.query;
    let query = {};

    if (email) query.guestEmail = email;
    if (status) query.status = status;
    if (attraction) query.attraction = attraction;

    const reservations = await Reservation.find(query)
      .populate('attraction')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// Update reservation status (admin only)
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    // If completing reservation, update queue positions
    if (status === 'completed' && reservation.status === 'active') {
      await Reservation.updateQueuePositions(reservation.attraction, reservation.queuePosition);
      
      // Update attraction queue count
      const attraction = await Attraction.findById(reservation.attraction);
      if (attraction) {
        attraction.currentQueue = Math.max(0, attraction.currentQueue - reservation.numberOfGuests);
        await attraction.save();
      }
    }

    reservation.status = status;
    await reservation.save();

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

// Get park settings
const getParkSettings = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;

    const settings = await ParkSetting.find(query).sort({ key: 1 });

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// Update park setting (admin only)
const updateParkSetting = async (req, res, next) => {
  try {
    const { key, value, description, category } = req.body;
    
    const setting = await ParkSetting.setSetting(key, value, description, category);

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    next(error);
  }
};

// Get attraction wait times
const getWaitTimes = async (req, res, next) => {
  try {
    const attractions = await Attraction.find({ status: 'open' }, 'name waitTime currentQueue');

    // Update wait times
    for (let attraction of attractions) {
      attraction.waitTime = attraction.calculateWaitTime();
      await attraction.save();
    }

    res.json({
      success: true,
      data: attractions.map(a => ({
        id: a._id,
        name: a.name,
        waitTime: a.waitTime,
        queueLength: a.currentQueue
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Check reservation status
const checkReservation = async (req, res, next) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    const reservations = await Reservation.find({ 
      guestEmail: email,
      status: 'active'
    })
    .populate('attraction')
    .sort({ reservationTime: -1 });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

// Admin API methods
const getAttractionsAdmin = async (req, res, next) => {
  try {
    const attractions = await Attraction.find().sort({ name: 1 });
    res.json({
      success: true,
      data: attractions
    });
  } catch (error) {
    next(error);
  }
};

const createAttractionAdmin = async (req, res, next) => {
  try {
    const attraction = new Attraction(req.body);
    await attraction.save();

    res.status(201).json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

const updateAttractionAdmin = async (req, res, next) => {
  try {
    const attraction = await Attraction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    res.json({
      success: true,
      data: attraction
    });
  } catch (error) {
    next(error);
  }
};

const deleteAttractionAdmin = async (req, res, next) => {
  try {
    const attraction = await Attraction.findByIdAndDelete(req.params.id);

    if (!attraction) {
      return res.status(404).json({
        success: false,
        error: 'Attraction not found'
      });
    }

    // Cancel all active reservations for this attraction
    await Reservation.updateMany(
      { attraction: req.params.id, status: 'active' },
      { status: 'cancelled' }
    );

    res.json({
      success: true,
      message: 'Attraction deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getReservationsAdmin = async (req, res, next) => {
  try {
    const { status, attraction } = req.query;
    let query = {};

    if (status) query.status = status;
    if (attraction) query.attraction = attraction;

    const reservations = await Reservation.find(query)
      .populate('attraction')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

const updateReservationAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reservation not found'
      });
    }

    // If completing reservation, update queue positions
    if (status === 'completed' && reservation.status === 'active') {
      await Reservation.updateQueuePositions(reservation.attraction, reservation.queuePosition);
      
      // Update attraction queue count
      const attraction = await Attraction.findById(reservation.attraction);
      if (attraction) {
        attraction.currentQueue = Math.max(0, attraction.currentQueue - reservation.numberOfGuests);
        await attraction.save();
      }
    }

    reservation.status = status;
    await reservation.save();

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttractions,
  getAttractionById,
  createReservation,
  checkReservation,
  getAttractionsAdmin,
  createAttractionAdmin,
  updateAttractionAdmin,
  deleteAttractionAdmin,
  getReservationsAdmin,
  updateReservationAdmin
};
