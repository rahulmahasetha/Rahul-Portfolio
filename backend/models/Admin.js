const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Date },
  vaultPassword: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', adminSchema);
