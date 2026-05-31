const mongoose = require('mongoose');

const navSchema = new mongoose.Schema({
  name: { type: String, required: true },
  href: { type: String, required: true },
  order: { type: Number, default: 100 },
  visible: { type: Boolean, default: true }
});

module.exports = mongoose.model('Nav', navSchema);
