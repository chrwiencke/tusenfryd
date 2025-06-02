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
router.delete('/attractions/:id', adminController.deleteAttraction);

// Reservation management
router.get('/reservations', adminController.getReservations);
router.get('/reservations/:id', adminController.getReservationDetails);
router.patch('/reservations/:id/status', adminController.updateReservationStatus);

// Park settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Internal notifications
router.get('/notifications', adminController.getNotifications);
router.post('/notifications', adminController.createNotification);

module.exports = router;
