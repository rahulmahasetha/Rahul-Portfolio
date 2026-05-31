const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  problem: { type: String, default: '' },
  features: { type: [String], default: [] },
  tech: { type: [String], default: [] },
  github: { type: String, default: '' },
  demo: { type: String, default: '' },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
