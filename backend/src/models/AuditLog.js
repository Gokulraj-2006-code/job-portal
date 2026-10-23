const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: { type: String, default: 'unknown' },
    adminName: { type: String, default: 'Admin' },
    action: { type: String, required: true },
    target: { type: String, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
