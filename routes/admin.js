const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth } = require('../middleware/auth');
const { validateAttraction, validateLogin } = require('../middleware/validation');
const { uploadSingle } = require('../middleware/upload');

// Login routes (public)
router.get('/login', adminController.showLogin);
router.post('/login', validateLogin, adminController.login);
router.post('/logout', adminController.logout);

// Protected admin routes
router.use(auth);

// Dashboard
router.get('/', adminController.getDashboard);

// Attraction management
router.get('/attractions', adminController.getAttractions);
router.get('/attractions/new', adminController.showAddAttraction);
router.post('/attractions', uploadSingle, validateAttraction, adminController.addAttraction);
router.get('/attractions/:id', adminController.getAttractionDetails);
router.get('/attractions/:id/edit', adminController.showEditAttraction);
router.put('/attractions/:id', uploadSingle, validateAttraction, adminController.updateAttraction);
router.post('/attractions/:id', uploadSingle, validateAttraction, adminController.updateAttraction); // Support form with method override
router.delete('/attractions/:id', adminController.deleteAttraction);
router.post('/attractions/:id/delete', adminController.deleteAttraction); // Support form deletion

// Reservation management
router.get('/reservations', adminController.getReservations);
router.get('/reservations/:id', adminController.getReservationDetails);
router.patch('/reservations/:id/status', adminController.updateReservationStatus);
router.put('/reservations/:id/status', adminController.updateReservationStatus); // Support both PUT and PATCH
router.post('/reservations/:id/status', adminController.updateReservationStatus); // Support form POST

// Park settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Internal notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);

// API endpoints for admin
router.get('/api/attraction-status', async (req, res) => {
  try {
    const attractions = await require('../models/Attraction').find({}, 'name status waitTime currentQueue');
    res.json(attractions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attraction status' });
  }
});

router.get('/api/reservation-counts', async (req, res) => {
  try {
    const Reservation = require('../models/Reservation');
    const counts = {
      active: await Reservation.countDocuments({ status: 'active' }),
      pending: await Reservation.countDocuments({ status: 'pending' }),
      completed: await Reservation.countDocuments({ status: 'completed' }),
      cancelled: await Reservation.countDocuments({ status: 'cancelled' })
    };
    res.json(counts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservation counts' });
  }
});

// FAQ
router.get('/faq', adminController.getFAQ);

module.exports = router;
