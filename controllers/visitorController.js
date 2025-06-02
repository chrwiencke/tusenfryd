const Attraction = require('../models/Attraction');
const Reservation = require('../models/Reservation');
const ParkSetting = require('../models/ParkSetting');
const { validationResult } = require('express-validator');

// Homepage - display all attractions
const getHomepage = async (req, res, next) => {
  try {
    const attractions = await Attraction.find({ status: { $ne: 'maintenance' } })
      .sort({ name: 1 });
    
    // Update wait times for all attractions
    for (let attraction of attractions) {
      attraction.waitTime = attraction.calculateWaitTime();
      await attraction.save();
    }

    const parkHours = await ParkSetting.getSetting('park_hours', { open: '10:00', close: '22:00' });
    const notifications = await ParkSetting.find({ 
      category: 'notification', 
      isActive: true 
    }).sort({ createdAt: -1 }).limit(3);

    res.render('visitor/home', {
      title: 'Welcome to Tusenfryd',
      attractions,
      parkHours,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Search and filter attractions
const searchAttractions = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const attractions = await Attraction.find(query).sort({ name: 1 });

    // Update wait times
    for (let attraction of attractions) {
      attraction.waitTime = attraction.calculateWaitTime();
      await attraction.save();
    }

    res.render('visitor/attractions', {
      title: 'Attractions',
      attractions,
      searchQuery: search || '',
      selectedCategory: category || 'all',
      selectedStatus: status || 'all'
    });
  } catch (error) {
    next(error);
  }
};

// Get attraction details
const getAttractionDetails = async (req, res, next) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    
    if (!attraction) {
      return res.status(404).render('error', {
        title: 'Attraction Not Found',
        error: 'The attraction you are looking for does not exist.',
        statusCode: 404
      });
    }

    // Update wait time
    attraction.waitTime = attraction.calculateWaitTime();
    await attraction.save();

    // Get current queue count
    const queueCount = await Reservation.countDocuments({
      attraction: attraction._id,
      status: 'active'
    });

    res.render('visitor/attraction-details', {
      title: attraction.name,
      attraction,
      queueCount
    });
  } catch (error) {
    next(error);
  }
};

// Show reservation form
const showReservationForm = async (req, res, next) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    
    if (!attraction) {
      return res.status(404).render('error', {
        title: 'Attraction Not Found',
        error: 'The attraction you are looking for does not exist.',
        statusCode: 404
      });
    }

    if (attraction.status !== 'open') {
      return res.render('visitor/attraction-closed', {
        title: 'Attraction Closed',
        attraction
      });
    }

    const queueCount = await Reservation.countDocuments({
      attraction: attraction._id,
      status: 'active'
    });

    res.render('visitor/reservation-form', {
      title: `Reserve - ${attraction.name}`,
      attraction,
      queueCount
    });
  } catch (error) {
    next(error);
  }
};

// Create reservation
const createReservation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const attraction = await Attraction.findById(req.params.id);
      return res.status(400).render('visitor/reservation-form', {
        title: `Reserve - ${attraction.name}`,
        attraction,
        errors: errors.array(),
        formData: req.body
      });
    }

    const attraction = await Attraction.findById(req.params.id);
    
    if (!attraction || attraction.status !== 'open') {
      return res.status(400).render('error', {
        title: 'Reservation Failed',
        error: 'This attraction is currently not available for reservations.',
        statusCode: 400
      });
    }

    const reservation = new Reservation({
      attraction: attraction._id,
      guestName: req.body.guestName,
      guestEmail: req.body.guestEmail,
      guestPhone: req.body.guestPhone,
      numberOfGuests: req.body.numberOfGuests,
      notes: req.body.notes
    });

    await reservation.save();
    await reservation.populate('attraction');

    // Update attraction queue count
    attraction.currentQueue += parseInt(req.body.numberOfGuests);
    await attraction.save();

    res.render('visitor/reservation-success', {
      title: 'Reservation Confirmed',
      reservation
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
      return res.render('visitor/check-reservation', {
        title: 'Check Reservation'
      });
    }

    const reservations = await Reservation.find({ 
      guestEmail: email,
      status: 'active'
    })
    .populate('attraction')
    .sort({ reservationTime: -1 });

    res.render('visitor/reservation-status', {
      title: 'Your Reservations',
      reservations,
      email
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHomepage,
  searchAttractions,
  getAttractionDetails,
  showReservationForm,
  createReservation,
  checkReservation
};
