const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { validateReservation } = require('../middleware/validation');

// Homepage
router.get('/', visitorController.getHomepage);

// Attractions
router.get('/attractions', visitorController.searchAttractions);
router.get('/attractions/:id', visitorController.getAttractionDetails);

// Reservations
router.get('/attractions/:id/reserve', visitorController.showReservationForm);
router.post('/attractions/:id/reserve', validateReservation, visitorController.createReservation);

// Check reservation status
router.get('/check-reservation', visitorController.checkReservation);

module.exports = router;
