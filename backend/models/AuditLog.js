const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE'
  entityType: { type: String, required: true }, // e.g., 'Project', 'Skill'
  entityId: { type: String }, // Document ID
  adminEmail: { type: String, required: true },
  ip: { type: String },
  changes: { type: mongoose.Schema.Types.Mixed }, // Detailed changes if needed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
