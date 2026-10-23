const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    adminName: { type: String, default: 'Admin' },
  },
  { _id: false, id: true }
);

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Rejected', 'Hired', 'Withdrawn'],
      default: 'Applied',
    },
    appliedAt: { type: Date, default: Date.now },

    // Snapshot of the applicant-supplied form (kept flexible to match the
    // frontend's application form fields).
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    mobile: { type: String, default: '' },
    location: { type: String, default: '' },
    dob: { type: String, default: '' },
    gender: { type: String, default: '' },
    qualification: { type: String, default: '' },
    experience: { type: String, default: '' },
    skills: { type: String, default: '' },
    currentCompany: { type: String, default: '' },
    expectedSalary: { type: String, default: '' },
    coverLetter: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },

    // The resume submitted with this specific application. Stored as a
    // base64 data URL (matching what the frontend's file picker produces)
    // so the applicant list / detail views can use it directly as a
    // download/view link, exactly like the original mock implementation.
    resume: {
      name: { type: String, default: '' },
      size: { type: Number, default: 0 },
      data: { type: String, default: '' },
    },

    internalNotes: { type: [noteSchema], default: [] },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, seekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
