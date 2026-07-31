const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  collegeName: { type: String, required: true },
  degreeName: { type: String, required: true },
  location: { type: String, required: true },
  startYear: { type: String, required: true },
  passingOutYear: { type: String, required: true },
  percentage: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Education', educationSchema);
