const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/attractions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const name = file.fieldname + '-' + uniqueSuffix + extension;
    cb(null, name);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with options
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for single file upload
const uploadSingle = upload.single('image');

// Middleware for multiple file upload
const uploadMultiple = upload.array('images', 5); // Max 5 images

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files. Maximum is 5 files.' 
      });
    }
    return res.status(400).json({ 
      error: 'File upload error: ' + err.message 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: err.message 
    });
  }
  
  next();
};

// Helper function to delete uploaded file
const deleteFile = (filename) => {
  if (filename) {
    const filePath = path.join(uploadDir, filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error('Error deleting file:', err);
      }
    });
  }
};

// Helper function to get file URL
const getFileUrl = (filename) => {
  if (!filename) return null;
  return `/uploads/attractions/${filename}`;
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  deleteFile,
  getFileUrl
};
