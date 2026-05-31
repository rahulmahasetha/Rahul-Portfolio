const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 },
  displayOrder: { type: Number, default: 100 },
  description: { type: String, default: '' },
  iconUrl: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
