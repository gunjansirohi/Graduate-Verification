const multer = require("multer");
const path = require("path");
const fs = require("fs");
const rateLimit = require('express-rate-limit');
const crypto = require("crypto");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Student = require("../models/Student");
const Certificate = require("../models/Certificate");
const Notification = require('../models/Notification');

const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
// In your Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  // ... rest of config
});

// File filter for images only
// In your Multer config
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed!'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Process and optimize image
// In processImage function
const processImage = async (filePath) => {
  try {
    const optimizedBuffer = await sharp(filePath)
      .resize(800, 800, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 80, 
        progressive: true 
      })
      .toBuffer();

    // Overwrite original file with optimized version
    await fs.promises.writeFile(filePath, optimizedBuffer);
    
    return filePath;
  } catch (err) {
    console.error('Image processing error:', err);
    return filePath; // Return original if processing fails
  }
};

// ==============================
// Multer Configuration (Secure)
// ==============================
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "uploads/"),
//     filename: (req, file, cb) => {
//       const uniqueName =
//         crypto.randomBytes(8).toString("hex") + path.extname(file.originalname);
//       cb(null, uniqueName);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const filetypes = /xlsx|xls/;
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = filetypes.test(file.mimetype);
//     if (mimetype && extname) return cb(null, true);
//     cb(new Error("Only Excel files (xlsx, xls) are allowed!"));
//   },
// }).single("file");

// ========================
// Admin Login
// ========================
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: `Invalid credentials, Admin not found with this email ${email}` });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials, password is incorrect" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

res.cookie('adminToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
});

    res.status(200).json({ 
  message: "Login successful", 
  token 
});

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ========================
// Admin Login Rate Limit
// ========================
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: "Too many login attempts. Please try again after 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// ========================
// Admin Logout
// ========================
const logoutAdmin = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  
  res.status(200).json({ message: "Logged out successfully",
    clearLocalStorage: true 
   });
};

// ========================
// Upload Students File
// ========================
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded",
        type: "validation"
      });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetNameList = workbook.SheetNames;
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNameList[0]]);

    // Validate required fields
    const requiredFields = ['certificateID', 'firstName', 'lastName', 'department', 
                          'gender', 'cgpa', 'program', 'gstatus', 'college', 
                          'startDate', 'endDate'];
    
    const missingFields = requiredFields.filter(field => 
      !data[0] || data[0][field] === undefined
    );

    if (missingFields.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        type: "validation"
      });
    }

    // Check for duplicate certificateID within the file
    const certificateIDs = data.map(record => record.certificateID);
    const duplicateIDs = [...new Set(
      certificateIDs.filter((id, index) => certificateIDs.indexOf(id) !== index)
    )];

    if (duplicateIDs.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: `Duplicate certificateID(s) in file: ${duplicateIDs.join(', ')}`,
        type: "duplicate",
        duplicateIds: duplicateIDs
      });
    }

    // Check for existing certificateIDs in database
    const existingCertificates = await Certificate.find({
      certificateID: { $in: certificateIDs }
    });

    if (existingCertificates.length > 0) {
      fs.unlinkSync(req.file.path);
      const existingIDs = existingCertificates.map(cert => cert.certificateID);
      return res.status(400).json({
        success: false,
        message: `CertificateID(s) already exist in database: ${existingIDs.join(', ')}`,
        type: "duplicate",
        duplicateIds: existingIDs
      });
    }

    // Process and validate each record
    const students = [];
    const errors = [];

    data.forEach((record, index) => {
      try {
        // Validate and process each field
        if (!record.certificateID || record.certificateID.trim() === '') {
          throw new Error('CertificateID cannot be empty');
        }

        const startDate = new Date(record.startDate);
        if (isNaN(startDate.getTime())) throw new Error('Invalid start date format');
        
        const endDate = new Date(record.endDate);
        if (isNaN(endDate.getTime())) throw new Error('Invalid end date format');
        
        if (startDate > endDate) throw new Error('Start date cannot be after end date');
        
        const cgpa = parseFloat(record.cgpa);
        if (isNaN(cgpa) || cgpa < 0 || cgpa > 4) throw new Error('CGPA must be between 0 and 4');

        students.push({
          certificateID: record.certificateID.trim(),
          firstName: record.firstName.trim(),
          middleName: record.middleName?.trim() || '',
          lastName: record.lastName.trim(),
          department: record.department.trim(),
          gender: record.gender.trim(),
          cgpa,
          program: record.program.trim(),
          gstatus: record.gstatus.trim(),
          college: record.college.trim(),
          startDate,
          endDate
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Validation errors in Excel file',
        type: "validation",
        errors
      });
    }

    // Save to database with proper error handling
    try {
      const result = await Certificate.insertMany(students, { ordered: false });
      
      fs.unlinkSync(req.file.path);
      
      return res.status(201).json({ 
        success: true,
        message: "File processed successfully",
        recordsProcessed: result.length
      });

    } catch (mongoError) {
      fs.unlinkSync(req.file.path);
      
      if (mongoError.code === 11000) {
        // Extract duplicate IDs from the error
        let duplicateIds = [];
        
        if (mongoError.writeErrors) {
          duplicateIds = mongoError.writeErrors.map(err => err.err.op.certificateID);
        } else if (mongoError.keyValue) {
          duplicateIds = [mongoError.keyValue.certificateID];
        }

        return res.status(400).json({
          success: false,
          message: "Duplicate certificateID(s) found",
          type: "duplicate",
          duplicateIds,
          recordsProcessed: mongoError.result?.insertedCount || 0
        });
      }

      // For other MongoDB errors
      return res.status(500).json({
        success: false,
        message: "Database error occurred",
        type: "database",
        error: mongoError.message
      });
    }

  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Server error processing file",
      type: "server",
      error: error.message
    });
  }
};
// ========================
// Get All Certificates
// ========================
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find();
    if (!certificates.length=== 0) {
      return res.status(404).json({ message: "No certificates found" });
    }
    res.status(200).json(certificates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ========================
// Get Single Certificate
// ========================
const getSingleCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateID: req.params.certificateID,
    });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ========================
// Get notification
// ========================
const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({}).sort({ createdAt: -1 });
    if (!notifications.length) {
      return res.status(404).json({ message: "No notifications found" });
    }
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the notification and update its isRead field to true
    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true } // Return the updated document
    );

    if (!updatedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification: updatedNotification });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ========================
// Delete notification
// ========================
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the notification
    const deletedNotification = await Notification.findByIdAndDelete(id);

    if (!deletedNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ========================
// Update Single Certificate
// ========================
const updateSingleCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOneAndUpdate(
      { certificateID: req.params.certificateID },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ========================
// Delete Single Certificate
// ========================
const deleteSingleCertificate = async (req, res) => {
  try {
    const result = await Certificate.findOneAndDelete({
      certificateID: req.params.certificateID,
    });
    if (!result) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// ========================
// Add New Certificate
// ========================
const addStudentCredentials = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const {
      certificateID,
      firstName,
      middleName,
      lastName,
      department,
      college,
      gender,
      cgpa,
      program,
      programType,
      gstatus,
      startDate,
      endDate,
    } = req.body;

    const existing = await Certificate.findOne({ certificateID });
    if (existing) {
      return res
        .status(400)
        .json({ message: `Certificate ID ${certificateID} already exists` });
    }

    const certificate = new Certificate({
      certificateID: uuidv4(),
      firstName,
      middleName,
      lastName,
      department,
      college,
      gender,
      cgpa,
      program,
      programType,
      gstatus,
      startDate,
      endDate,
    });

    await certificate.save();
    res.status(201).json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// 
// add new account 
// 
const createUserByAdmin = async (req, res) => {
  try {
    const {
      nationalIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      email,
      password,
      role
    } = req.body;

    // Ensure the logged-in user is an admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }

    // Check for existing user by national ID or email
    const existingUser = await User.findOne({
      $or: [{ nationalIdNumber }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error:
          existingUser.nationalIdNumber === nationalIdNumber
            ? "National ID already registered"
            : "Email already in use",
      });
    }

    // Create user without email verification
    const newUser = new User({
      nationalIdNumber,
      firstName,
      middleName,
      lastName,
      gender,
      phone,
      email,
      password,
      role: role || 'user', // Default to user
      isVerified: true // Optional: mark as verified if your schema includes it
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully by admin.",
    });
  } catch (error) {
   console.error("Admin user creation error:", error.message, error.stack);

    res.status(500).json({
      success: false,
      error: "Failed to create user. Please try again.",
    });
  }
};

// ========================
// Get Registrar Users
// ========================
const getRegistrarUsers = async (req, res) => {
  try {
    // Ensure the logged-in user is an admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Unauthorized access' });
    }
    // Fetch all users with role 'registrar'
    const users = await User.find({ role: 'registrar' }, '-password -__v');
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, error: "No registrars found" });
    }
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Error fetching registrars:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};



// ========================
//delete account
// ========================

const editUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the user first
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    const updateFields = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      email: req.body.email,
      role: req.body.role,
    };

    // Handle file upload if exists
    if (req.file) {
      try {
        // Process the image
        await processImage(req.file.path);
        
        // Construct proper URL path
        const publicDir = path.join(__dirname, '..', 'public');
        const relativePath = path.relative(publicDir, req.file.path).replace(/\\/g, '/');
        updateFields.photo = `/${relativePath}`;
        
        // Delete old photo if exists (and not a default random image)
        if (user.photo && !user.photo.includes('randomuser.me')) {
          const oldPhotoPath = path.join(
            publicDir,
            user.photo.startsWith('/') ? user.photo.substring(1) : user.photo
          );
          
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
      } catch (fileError) {
        console.error('File processing error:', fileError);
        if (req.file?.path) fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          error: 'Failed to process profile photo'
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({ 
      success: true, 
      user: updatedUser,
      message: "User updated successfully"
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Server error" 
    });
  }
};

// Delete User Account with Local Image Cleanup
const deleteUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Delete user's photo if exists
    if (user.photo && !user.photo.includes('randomuser.me')) {
      try {
        const photoPath = path.join(
          __dirname, 
          'public', 
          user.photo.startsWith('/') ? user.photo.slice(1) : user.photo
        );
        
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      } catch (fileError) {
        console.error('Failed to delete photo:', fileError);
        // Continue with user deletion even if photo deletion fails
      }
    }

    await User.findByIdAndDelete(userId);

    res.json({ 
      success: true, 
      message: "User deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Server error" 
    });
  }
};

// ========================
// get all users role = user
// ========================


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }, '-password -__v');
    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, error: "No users found" });
    }
    res.status(200).json(users );
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ========================
// edit User Account
// ========================
const updateExternalUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      firstName,
      lastName,
      email,
      phone,
      role,
      isVerified,
      verificationCode 
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields" 
      });
    }

    // Check if email is valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid email format" 
      });
    }

    // Check if phone is valid (1-15 digits)
    if (!/^\d{1,15}$/.test(phone)) {
      return res.status(400).json({ 
        success: false, 
        error: "Phone must contain 1-15 digits" 
      });
    }

    const updateData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role,
      isVerified,
      ...(!isVerified && verificationCode ? { verificationCode } : { verificationCode: null })
    };

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error updating user:", error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false, 
        error: `${field} already exists` 
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        success: false, 
        error: messages 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
};

// ========================
// Delete User Account
// ========================
const deleteExternalUser = async (req, res) => {
  try {
    const { id } = req.params;

    // First find the user to get their details (optional)
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Then delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: `User ${user.firstName} ${user.lastName} deleted successfully`,
      deletedUserId: id 
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
  }
};
// ========================
// Export Controllers
// ========================
module.exports = {
  loginLimiter,
  deleteExternalUser,
  updateExternalUser,
  getAllUsers,
  upload,
  getRegistrarUsers,
addStudentCredentials,
createUserByAdmin,
deleteNotification,
deleteUserAccount,
deleteSingleCertificate,
editUserAccount,
getAllCertificates,
getNotification,
getSingleCertificate,
loginAdmin,
logoutAdmin,
markNotificationAsRead,
updateSingleCertificate,
uploadFile,
};