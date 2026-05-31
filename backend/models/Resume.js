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
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
