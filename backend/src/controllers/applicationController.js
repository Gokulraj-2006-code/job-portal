const asyncHandler = require('../utils/asyncHandler');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { serialize, serializeMany } = require('../utils/serialize');
const { attachCompany } = require('./jobController');

// @desc    Apply to a job (job seeker)
// @route   POST /api/jobs/:id/apply
// @access  Private/Seeker
const applyToJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  const job = await Job.findById(jobId);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const existing = await Application.findOne({ jobId, seekerId: req.user.id });
  if (existing) {
    return res.status(400).json({ message: 'You have already applied to this job' });
  }

  const {
    fullName, email, mobile, location, dob, gender,
    qualification, experience, skills, currentCompany, expectedSalary, coverLetter,
    portfolioUrl, resume,
  } = req.body;

  const application = await Application.create({
    jobId,
    seekerId: req.user.id,
    status: 'Applied',
    fullName, email, mobile, location, dob, gender,
    qualification, experience, skills, currentCompany, expectedSalary, coverLetter,
    portfolioUrl,
    resume: resume ? { name: resume.name, size: resume.size, data: resume.data } : undefined,
  });

  job.applicants = (job.applicants || 0) + 1;
  await job.save();

  res.status(201).json(serialize(application));
});

// @desc    Get the logged-in seeker's applications
// @route   GET /api/jobs/applications/me
// @access  Private/Seeker
const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ seekerId: req.user.id }).sort({ appliedAt: -1 });
  const result = await Promise.all(
    applications.map(async (app) => {
      const plain = serialize(app);
      const job = await Job.findById(app.jobId);
      plain.job = job ? await attachCompany(job) : null;
      return plain;
    })
  );
  res.json(result);
});

// @desc    Get applicants for a specific job (recruiter)
// @route   GET /api/jobs/:id/applicants
// @access  Private/Recruiter
const getJobApplicants = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const isOwner = job.recruiterId && job.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to view these applicants' });
  }

  const applications = await Application.find({ jobId: req.params.id });
  const result = await Promise.all(
    applications.map(async (app) => {
      const plain = serialize(app);
      const seeker = await User.findById(app.seekerId);
      plain.seeker = seeker ? seeker.toSafeObject() : null;
      return plain;
    })
  );
  res.json(result);
});

// @desc    Get all applications across the recruiter's jobs
// @route   GET /api/jobs/recruiter/applications
// @access  Private/Recruiter
const getRecruiterApplications = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.user.id });
  const jobIds = jobs.map((j) => j._id);
  const applications = await Application.find({ jobId: { $in: jobIds } }).sort({ appliedAt: -1 });

  const result = await Promise.all(
    applications.map(async (app) => {
      const plain = serialize(app);
      const seeker = await User.findById(app.seekerId);
      const job = jobs.find((j) => j._id.toString() === app.jobId.toString());
      plain.seeker = seeker ? seeker.toSafeObject() : null;
      plain.job = job ? await attachCompany(job) : null;
      return plain;
    })
  );
  res.json(result);
});

// @desc    Update an application's status (recruiter/admin)
// @route   PUT /api/applications/:id/status
// @access  Private/Recruiter|Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });

  if (req.user.role === 'recruiter') {
    const job = await Job.findById(application.jobId);
    if (!job || job.recruiterId?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this application' });
    }
  }

  application.status = status;
  await application.save();
  res.json(serialize(application));
});

// @desc    Withdraw an application (seeker)
// @route   DELETE /api/applications/:id
// @access  Private/Seeker
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });
  if (application.seekerId.toString() !== req.user.id) {
    return res.status(403).json({ message: 'You do not have permission to withdraw this application' });
  }

  await application.deleteOne();

  const job = await Job.findById(application.jobId);
  if (job && job.applicants > 0) {
    job.applicants -= 1;
    await job.save();
  }

  res.json({ message: 'Application withdrawn' });
});

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  getRecruiterApplications,
  updateApplicationStatus,
  withdrawApplication,
};
