const { body } = require('express-validator');

// User validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Attraction validation
const validateAttraction = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Attraction name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be a number between 1 and 1000'),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'maintenance'])
    .withMessage('Status must be open, closed, or maintenance'),
  body('category')
    .optional()
    .isIn(['roller-coaster', 'family', 'thrill', 'water', 'children'])
    .withMessage('Invalid category'),
  body('heightRequirement')
    .optional()
    .isInt({ min: 0, max: 200 })
    .withMessage('Height requirement must be between 0 and 200 cm'),
  body('openingHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('openingHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format')
];

// Reservation validation
const validateReservation = [
  body('guestName')
    .trim()
    .notEmpty()
    .withMessage('Guest name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZæøåÆØÅ\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('guestEmail')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('guestPhone')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value && value.length > 0) {
        if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(value)) {
          throw new Error('Please provide a valid phone number');
        }
      }
      return true;
    }),
  body('numberOfGuests')
    .isInt({ min: 1, max: 10 })
    .withMessage('Number of guests must be between 1 and 10'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Park setting validation
const validateParkSetting = [
  body('key')
    .trim()
    .notEmpty()
    .withMessage('Setting key is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Key must be between 2 and 50 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Key can only contain lowercase letters, numbers, and underscores'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Description must be between 5 and 200 characters'),
  body('category')
    .optional()
    .isIn(['hours', 'notification', 'general', 'emergency'])
    .withMessage('Invalid category')
];

// Notification validation
const validateNotification = [
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),
  body('type')
    .optional()
    .isIn(['info', 'warning', 'danger', 'success'])
    .withMessage('Type must be info, warning, danger, or success')
];

module.exports = {
  validateLogin,
  validateAttraction,
  validateReservation,
  validateParkSetting,
  validateNotification
};
