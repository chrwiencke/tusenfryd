const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { auth } = require('../middleware/auth');

// Public API endpoints
router.get('/attractions', apiController.getAttractions);
router.get('/attractions/:id', apiController.getAttractionById);
router.post('/reservations', apiController.createReservation);
router.get('/reservations/check', apiController.checkReservation);

// Protected API endpoints
router.use(auth);
router.get('/admin/attractions', apiController.getAttractionsAdmin);
router.post('/admin/attractions', apiController.createAttractionAdmin);
router.put('/admin/attractions/:id', apiController.updateAttractionAdmin);
router.delete('/admin/attractions/:id', apiController.deleteAttractionAdmin);
router.get('/admin/reservations', apiController.getReservationsAdmin);
router.patch('/admin/reservations/:id', apiController.updateReservationAdmin);

module.exports = router;
