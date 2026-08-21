const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
