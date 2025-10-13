const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User'); // Make sure to import your User model

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'public/uploads/profiles';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Update profile endpoint
const updateProfile = async (req, res) => {
  try {
    // Validate request
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Invalid user session'
      });
    }

    const { phone } = req.body;
    const updates = { phone };

    // Handle file upload if present
    if (req.file) {
      console.log('Uploaded file:', req.file); // Debug log
      
      // Delete old photo if it exists
      if (req.user.photo) {
        const oldPhotoPath = path.join('public', req.user.photo);
        try {
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        } catch (fileError) {
          console.error('Error deleting old photo:', fileError);
        }
      }
      
      // Add null check for req.file
      if (!req.file.filename) {
        throw new Error('File upload failed - missing filename');
      }
      
      updates.photo = `/uploads/profiles/${req.file.filename}`;
    }

    // Rest of your controller remains the same...
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, select: '-password -__v' }
    );

    if (!updatedUser) {
      throw new Error('User not found in database');
    }

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Profile update error:', error);
    
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up uploaded file:', cleanupError);
      }
    }

    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

module.exports = {
  updateProfile,
  upload
};