const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Star' },
  color: { type: String, default: 'from-blue-500 to-indigo-600' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Achievement', achievementSchema);
