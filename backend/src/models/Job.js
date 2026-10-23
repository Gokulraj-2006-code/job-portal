const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    location: { type: String, required: true },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      default: 'Full-time',
    },
    category: { type: String, default: 'Engineering' },
    experienceLevel: { type: String, default: 'Entry' },
    remote: { type: Boolean, default: false },
    salaryMin: { type: Number, default: 0 },
    salaryMax: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
    applicants: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

jobSchema.index({ title: 'text', location: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
