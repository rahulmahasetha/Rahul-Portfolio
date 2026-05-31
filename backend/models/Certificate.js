const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String, // e.g., 'Technical Certificates', 'Academic Certificates'
    required: true,
  },
  certificateType: {
    type: String, // e.g., 'Java', 'Web Development', '10th Class Certificates'
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  certificateId: {
    type: String, // Optional, depending on the certificate
  },
  imageUrl: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String, // Link to download/view the certificate document
  },
  description: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
