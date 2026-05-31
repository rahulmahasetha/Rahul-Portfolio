const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
  iconUrl: { type: String, default: '' },
  order: { type: Number, default: 100 }
});

module.exports = mongoose.model('Stat', statSchema);
