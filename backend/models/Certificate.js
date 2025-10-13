const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema({
  certificateID: {
    type: String,
    required: true,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  program: {
    type: String,
    enum: ['BSc', 'MSc', 'PhD'],
    required: true,
    default: 'BSc'
  },
    programType: {
    type: String,
    enum: ['regular', 'weekend', 'extension', 'summer', 'distance', 'night'],
    required: true,
    default: 'Regular'
  },
  gstatus: {
    type: String,
    enum: ['verified', 'pending', 'suspended'],
    required: true,
    default: 'pending'
  },
  cgpa: {
    type: Number,
    required: true,
    min: 2, // optional: minimum value constraint
    max: 4, // optional: maximum value constraint (assuming 4.0 scale)
  },
  gender: { 
    type: String, 
    required: true,
    enum: ['male', 'female'],
    lowercase: true
  },
  photo: {
    type: String,
    default: function() {
      const id = Math.floor(Math.random() * 100);
      return `https://randomuser.me/api/portraits/${this.gender === 'male' ? 'men' : 'women'}/${id}.jpg`;
    }
  },

 startDate: {
    type: Date,
    required: true,
    default: Date.now() - 1000 * 60 * 60 * 24 * 365 * 4
  
  },
  endDate: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Certificate", CertificateSchema);
