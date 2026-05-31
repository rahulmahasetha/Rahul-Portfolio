#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/Admin');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';
const newPassword = process.argv[2];
const email = process.argv[3] || process.env.ADMIN_EMAIL || 'admin@example.com';

if (!newPassword) {
  console.error('Usage: node reset_admin_password.js <newPassword> [email]');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await Admin.findOneAndUpdate(
      { email },
      { email, password: hashed },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    console.log(`Admin password reset for ${email}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err);
    process.exit(1);
  }
})();
