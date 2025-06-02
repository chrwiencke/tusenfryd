const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    error = { statusCode: 400, message };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error = { statusCode: 400, message: 'Invalid ID format' };
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Invalid token' };
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Token expired' };
  }

  // API vs Web response
  if (req.path.startsWith('/api/') || req.headers.accept?.includes('application/json')) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Web response
  res.status(error.statusCode).render('error', {
    title: 'Error',
    error: error.message,
    statusCode: error.statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
