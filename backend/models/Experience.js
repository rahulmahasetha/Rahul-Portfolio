const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  role: { type: String, required: true },
  organization: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: String, required: true },
  endDate: { type: String, default: 'Present' },
  imageUrl: { type: String, default: '' },
  imagePublicId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Experience', experienceSchema);
