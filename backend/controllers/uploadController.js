const Certificate = require('../models/Certificate');
// const NationalID =  require('../../nationalidapi/models/NationalID');
const excelToJson = require('convert-excel-to-json');
const fs = require('fs');

const uploadExcelFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded',
        type: 'validation'
      });
    }

    const filePath = req.file.path;

    // Convert Excel to JSON
    const result = excelToJson({
      sourceFile: filePath,
      sheets: [{
        name: 'Sheet1',
        header: { rows: 1 },
        columnToKey: {
          A: 'firstName',
          B: 'middleName',
          C: 'lastName',
          D: 'gender',
          E: 'certificateID',
          F: 'college',
          G: 'department',
          H: 'cgpa',
          I: 'startDate',
          J: 'endDate',
          K: 'program',
          L: 'gstatus' , 
          M: 'programType',   
        }
      }]
    });

    const certificates = result.Sheet1;

    if (!certificates || certificates.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'No valid data found in the Excel file',
        type: 'validation'
      });
    }

    // Validate required fields
    const requiredFields = ['certificateID', 'firstName', 'middleName', 'lastName', 'department', 
                          'college', 'cgpa', 'startDate', 'endDate', 
                          'gender', 'program', 'gstatus', 'programType'];
    
    const missingFields = requiredFields.filter(field => 
      !certificates[0][field]
    );

    if (missingFields.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        type: 'validation'
      });
    }
    // madiso Melese

    // Check for duplicates in the file
    const certificateIDs = certificates.map(c => c.certificateID);
    const fileDuplicates = [...new Set(
      certificateIDs.filter((id, index) => certificateIDs.indexOf(id) !== index)
    )];

    if (fileDuplicates.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `Duplicate certificateIDs in file: ${fileDuplicates.join(', ')}`,
        type: 'duplicate',
        duplicateIds: fileDuplicates
      });
    }

    // Check for existing certificateIDs in database
    const existingCerts = await Certificate.find({
      certificateID: { $in: certificateIDs }
    });

    if (existingCerts.length > 0) {
      const existingIDs = existingCerts.map(c => c.certificateID);
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: `CertificateIDs already exist: ${existingIDs.join(', ')}`,
        type: 'duplicate',
        duplicateIds: existingIDs
      });
    }

    // Process and validate each record
    const validCertificates = [];
    const errors = [];

    certificates.forEach((cert, index) => {
      try {
        // Validate certificateID
        if (!cert.certificateID || cert.certificateID.trim() === '') {
          throw new Error('CertificateID cannot be empty');
        }

        // Validate dates
        const startDate = new Date(cert.startDate);
        const endDate = new Date(cert.endDate);
        
        if (isNaN(startDate.getTime())) throw new Error('Invalid start date');
        if (isNaN(endDate.getTime())) throw new Error('Invalid end date');
        if (startDate > endDate) throw new Error('Start date must be before end date');

        // Validate CGPA
        const cgpa = parseFloat(cert.cgpa);
        if (isNaN(cgpa)) throw new Error('CGPA must be a number');
        if (cgpa < 0 || cgpa > 4) throw new Error('CGPA must be between 0 and 4');

        validCertificates.push({
          firstName: cert.firstName.trim(),
          middleName: cert.middleName?.trim(),
          lastName: cert.lastName.trim(),
          gender: cert.gender.trim(),
          certificateID: cert.certificateID.trim(),
          college: cert.college.trim(),
          department: cert.department.trim(),
          cgpa,
          startDate,
          endDate,
          program: cert.program.trim(),
          programType: cert.programType.trim(),
          gstatus: cert.gstatus.trim()
        });
      } catch (error) {
        errors.push(`Row ${index + 2}: ${error.message}`);
      }
    });

    if (errors.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        message: 'Validation errors found',
        type: 'validation',
        errors
      });
    }

    // Insert with duplicate handling
    try {
      const result = await Certificate.insertMany(validCertificates, { ordered: false });
      fs.unlinkSync(filePath);
      
      return res.status(201).json({
        success: true,
        message: 'File processed successfully',
        recordsProcessed: result.length
      });
    } catch (mongoError) {
      fs.unlinkSync(filePath);
      
      if (mongoError.code === 11000) {
        const duplicates = mongoError.writeErrors?.map(err => err.err.op.certificateID) || 
                         [mongoError.keyValue?.certificateID] || 
                         ['Unknown'];
        
        return res.status(400).json({
          success: false,
          message: `Duplicate certificateIDs detected: ${duplicates.join(', ')}`,
          type: 'duplicate',
          duplicateIds: duplicates,
          recordsProcessed: mongoError.result?.insertedCount || 0
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Database error occurred',
        type: 'database',
        error: mongoError.message
      });
    }

  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    next(error);
  }
};

const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findOne({ certificateID: req.params.id });

    if (!certificate) {
      return res.status(404).json({ 
        success: false,
        message: 'Certificate not found',
        type: 'not_found'
      });
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCertificateById,
  uploadExcelFile
};