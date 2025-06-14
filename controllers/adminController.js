const User = require('../models/User');
const Attraction = require('../models/Attraction');
const Reservation = require('../models/Reservation');
const ParkSetting = require('../models/ParkSetting');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Login page
const showLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/admin/');
  }
  res.render('admin/login', {
    title: 'Admin Login'
  });
};

// Login process
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('admin/login', {
        title: 'Admin Login',
        errors: errors.array(),
        formData: req.body
      });
    }

    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    
    const user = await User.findOne({ username, isActive: true });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (user) {
      console.log('Stored password hash:', user.password);
      const passwordMatch = await user.comparePassword(password);
      console.log('Password comparison result:', passwordMatch);
      
      if (!passwordMatch) {
        return res.status(401).render('admin/login', {
          title: 'Admin Login',
          errors: [{ msg: 'Invalid username or password' }],
          formData: req.body
        });
      }
    } else {
      return res.status(401).render('admin/login', {
        title: 'Admin Login',
        errors: [{ msg: 'Invalid username or password' }],
        formData: req.body
      });
    }

    // Update last login
    console.log('Updating last login...');
    try {
      user.lastLogin = new Date();
      await user.save();
      console.log('Last login updated successfully');
    } catch (saveError) {
      console.error('Error updating last login:', saveError);
      throw saveError;
    }

    // Generate JWT
    console.log('Generating JWT token...');
    let token;
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
      }
      token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );
      console.log('JWT token generated successfully');
    } catch (jwtError) {
      console.error('Error generating JWT token:', jwtError);
      throw jwtError;
    }

    console.log('Setting auth cookie...');
    try {
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 8 * 60 * 60 * 1000 // 8 hours
      });
      console.log('Auth cookie set successfully');
    } catch (cookieError) {
      console.error('Error setting cookie:', cookieError);
      throw cookieError;
    }

    console.log('Redirecting to dashboard...');
    try {
      res.redirect('/admin/');
    } catch (redirectError) {
      console.error('Error redirecting:', redirectError);
      throw redirectError;
    }
  } catch (error) {
    console.error('Login process error:', error);
    next(error);
  }
};

// Logout
const logout = (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/admin/login');
};

// Dashboard
const getDashboard = async (req, res, next) => {
  try {
    const attractionsCount = await Attraction.countDocuments();
    const activeReservations = await Reservation.countDocuments({ status: 'active' });
    const openAttractions = await Attraction.countDocuments({ status: 'open' });
    const closedAttractions = await Attraction.countDocuments({ status: 'closed' });

    const recentReservations = await Reservation.find({ status: 'active' })
      .populate('attraction')
      .sort({ createdAt: -1 })
      .limit(10);

    const notifications = await ParkSetting.find({ 
      category: 'notification', 
      isActive: true 
    }).sort({ createdAt: -1 }).limit(5);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      stats: {
        attractionsCount,
        activeReservations,
        openAttractions,
        closedAttractions
      },
      recentReservations,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Attractions management
const getAttractions = async (req, res, next) => {
  try {
    const attractions = await Attraction.find().sort({ name: 1 });
    res.render('admin/attractions', {
      title: 'Manage Attractions',
      attractions,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const showAddAttraction = (req, res) => {
  res.render('admin/attraction-form', {
    title: 'Add New Attraction',
    user: req.user,
    attraction: null,
    isEdit: false
  });
};

const addAttraction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('admin/attraction-form', {
        title: 'Add New Attraction',
        attraction: null,
        isEdit: false,
        errors: errors.array(),
        formData: req.body
      });
    }

    const attraction = new Attraction(req.body);
    await attraction.save();

    res.redirect('/admin/attractions?success=Attraction added successfully');
  } catch (error) {
    next(error);
  }
};

const showEditAttraction = async (req, res, next) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).render('error', {
        title: 'Attraction Not Found',
        error: 'Attraction not found',
        statusCode: 404
      });
    }

    res.render('admin/attraction-form', {
      title: 'Edit Attraction',
      attraction,
      isEdit: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const updateAttraction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const attraction = await Attraction.findById(req.params.id);
      return res.status(400).render('admin/attraction-form', {
        title: 'Edit Attraction',
        attraction,
        isEdit: true,
        errors: errors.array(),
        formData: req.body
      });
    }

    await Attraction.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/admin/attractions?success=Attraction updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteAttraction = async (req, res, next) => {
  try {
    await Attraction.findByIdAndDelete(req.params.id);
    res.redirect('/admin/attractions?success=Attraction deleted successfully');
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

    // Get current reservations for this attraction
    const reservations = await Reservation.find({ 
      attraction: attraction._id,
      status: { $in: ['pending', 'active'] }
    }).sort({ queuePosition: 1 }).limit(10);

    // Calculate current wait time
    attraction.waitTime = attraction.calculateWaitTime();
    await attraction.save();

    res.render('admin/attraction-details', {
      title: `${attraction.name} - Details`,
      attraction,
      reservations,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Reservations management
const getReservations = async (req, res, next) => {
  try {
    const { status = 'active', attraction } = req.query;
    let query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (attraction) {
      query.attraction = attraction;
    }

    const reservations = await Reservation.find(query)
      .populate('attraction')
      .sort({ createdAt: -1 });

    const attractions = await Attraction.find().sort({ name: 1 });

    // Calculate stats for different reservation statuses
    const stats = {
      waiting: await Reservation.countDocuments({ status: 'active' }), // Use active for waiting
      active: await Reservation.countDocuments({ status: 'active' }),
      completed: await Reservation.countDocuments({ status: 'completed' }),
      cancelled: await Reservation.countDocuments({ status: 'cancelled' })
    };

    res.render('admin/reservations', {
      title: 'Manage Reservations',
      reservations,
      attractions,
      selectedStatus: status,
      selectedAttraction: attraction || '',
      stats,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

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

    // Validate status
    const validStatuses = ['active', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status provided'
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

    // If cancelling reservation, also update queue positions and attraction count
    if (status === 'cancelled' && reservation.status === 'active') {
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

    // Check if this is an AJAX request
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        success: true,
        message: 'Reservation status updated successfully',
        data: reservation
      });
    }

    res.redirect('/admin/reservations?success=Reservation status updated');
  } catch (error) {
    console.error('Update reservation status error:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update reservation status'
      });
    }
    next(error);
  }
};

// Get reservation details
const getReservationDetails = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('attraction');
    
    if (!reservation) {
      return res.status(404).render('error', {
        title: 'Reservation Not Found',
        error: 'The reservation you are looking for does not exist.',
        statusCode: 404
      });
    }

    res.render('admin/reservation-details', {
      title: `Reservation Details - ${reservation.confirmationCode}`,
      reservation,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

// Settings management
const getSettings = async (req, res, next) => {
  try {
    const settings = await ParkSetting.find().sort({ category: 1, key: 1 });
    
    // Calculate stats for the settings page
    const totalAttractions = await Attraction.countDocuments();
    const activeReservations = await Reservation.countDocuments({ status: 'active' });
    const openAttractions = await Attraction.countDocuments({ status: 'open' });

    // Convert settings to object for easier access in template
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });

    res.render('admin/settings', {
      title: 'Park Settings',
      settings: settingsObj,
      stats: {
        totalAttractions,
        activeReservations,
        openAttractions
      },
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
      await ParkSetting.setSetting(key, value);
    }

    res.redirect('/admin/settings?success=Settings updated successfully');
  } catch (error) {
    next(error);
  }
};

// Notifications management
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await ParkSetting.find({ 
      category: 'notification'
    }).sort({ createdAt: -1 });

    res.render('admin/notifications', {
      title: 'Manage Notifications',
      notifications,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, isActive } = req.body;
    
    const notificationData = {
      title,
      message,
      type: type || 'info'
    };

    await ParkSetting.setSetting(
      `notification_${Date.now()}`,
      notificationData,
      `Notification: ${title}`,
      'notification'
    );

    res.redirect('/admin/notifications?success=Notification created successfully');
  } catch (error) {
    next(error);
  }
};

// FAQ management
const getFAQ = async (req, res, next) => {
  try {
    const faqItems = await ParkSetting.find({ 
      category: 'faq',
      isActive: true 
    }).sort({ createdAt: -1 });

    res.render('admin/faq', {
      title: 'Admin FAQ',
      faqItems,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  showLogin,
  login,
  logout,
  getDashboard,
  getAttractions,
  showAddAttraction,
  addAttraction,
  showEditAttraction,
  updateAttraction,
  deleteAttraction,
  getAttractionDetails,
  getReservations,
  updateReservationStatus,
  getReservationDetails,
  getSettings,
  updateSettings,
  getNotifications,
  createNotification,
  getFAQ
};
