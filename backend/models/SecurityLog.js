const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  email: { type: String }, // Email attempted
  ip: { type: String, required: true },
  browser: { type: String },
  os: { type: String },
  device: { type: String }, // e.g. Desktop, Mobile
  location: {
    country: String,
    region: String,
    city: String,
    ll: [Number] // latitude, longitude
  },
  status: { type: String, enum: ['success', 'failure'], required: true },
  snapshotUrl: { type: String },
  isNewDevice: { type: Boolean, default: false },
  isPermanent: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Index for querying recent attempts from IP quickly
securityLogSchema.index({ ip: 1, createdAt: -1 });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
