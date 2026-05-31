const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  description: { type: String, default: '' },
  type: { type: String, default: 'work' },
  iconUrl: { type: String, default: '' },
  order: { type: Number, default: 100 }
});

module.exports = mongoose.model('Timeline', timelineSchema);
