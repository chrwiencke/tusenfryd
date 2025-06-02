const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Import routes
const visitorRoutes = require('./routes/visitor');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { handleUploadError } = require('./middleware/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tusenfryd')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Routes
app.use('/', visitorRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// File upload error handling
app.use(handleUploadError);

// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    error: 'The page you are looking for does not exist.',
    statusCode: 404
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Tusenfryd server running on port ${PORT}`);
});

module.exports = app;
