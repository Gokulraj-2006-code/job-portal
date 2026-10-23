const asyncHandler = require('../utils/asyncHandler');
const Job = require('../models/Job');
const Company = require('../models/Company');
const SavedJob = require('../models/SavedJob');
const Settings = require('../models/Settings');
const { serialize, serializeMany } = require('../utils/serialize');

// Attaches a lightweight company object to a job, matching the shape the
// mock db's withCompany() helper produced.
const attachCompany = async (job) => {
  const plain = serialize(job);
  if (!plain.companyId) {
    plain.company = null;
    return plain;
  }
  const company = await Company.findById(plain.companyId);
  plain.company = company
    ? { id: company._id.toString(), name: company.name, logo: company.logo, industry: company.industry }
    : null;
  return plain;
};

const attachCompanyMany = async (jobs) => Promise.all(jobs.map(attachCompany));

// @desc    List active jobs with optional filters
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  const { search, category, type, experienceLevel, company, location, remote, salaryMin, salaryMax } = req.query;

  const query = { status: 'active' };

  if (category && category !== 'All') query.category = category;
  if (type && type !== 'All') query.type = type;
  if (experienceLevel && experienceLevel !== 'All') query.experienceLevel = experienceLevel;
  if (company && company !== 'All') query.companyId = company;
  if (location) query.location = { $regex: location, $options: 'i' };
  if (remote === 'true' || remote === true) query.remote = true;
  if (salaryMin) query.salaryMax = { ...(query.salaryMax || {}), $gte: Number(salaryMin) };
  if (salaryMax) query.salaryMin = { ...(query.salaryMin || {}), $lte: Number(salaryMax) };

  if (search) {
    const needle = String(search);
    query.$or = [
      { title: { $regex: needle, $options: 'i' } },
      { location: { $regex: needle, $options: 'i' } },
      { skills: { $regex: needle, $options: 'i' } },
    ];
  }

  const jobs = await Job.find(query).sort({ createdAt: -1 });

  // Search also matches on company name, which requires a join - filter
  // that in after the fact if a search term was provided.
  let result = await attachCompanyMany(jobs);
  if (search) {
    const needle = String(search).toLowerCase();
    result = result.filter((job) => {
      const inTitle = job.title.toLowerCase().includes(needle);
      const inLocation = job.location.toLowerCase().includes(needle);
      const inSkills = (job.skills || []).some((s) => s.toLowerCase().includes(needle));
      const inCompany = (job.company?.name || '').toLowerCase().includes(needle);
      return inTitle || inLocation || inSkills || inCompany;
    });
  }

  res.json(result);
});

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Public
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  res.json(await attachCompany(job));
});

// @desc    Create a job (recruiter)
// @route   POST /api/jobs
// @access  Private/Recruiter
const createJob = asyncHandler(async (req, res) => {
  if (req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Only recruiters can post jobs' });
  }
  if (!req.user.companyId) {
    return res.status(400).json({ message: 'You must have a company profile before posting jobs' });
  }

  const { title, location, type, category, experienceLevel, remote, salaryMin, salaryMax, skills, description } =
    req.body;

  if (!title || !location) {
    return res.status(400).json({ message: 'Title and location are required' });
  }

  const job = await Job.create({
    title,
    companyId: req.user.companyId,
    recruiterId: req.user.id,
    location,
    type: type || 'Full-time',
    category: category || 'Engineering',
    experienceLevel: experienceLevel || 'Entry',
    remote: !!remote,
    salaryMin: Number(salaryMin) || 0,
    salaryMax: Number(salaryMax) || 0,
    skills: skills || [],
    description: description || '',
    status: 'pending',
  });

  res.status(201).json(await attachCompany(job));
});

// @desc    Update a job (owning recruiter or admin)
// @route   PUT /api/jobs/:id
// @access  Private/Recruiter|Admin
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const isOwner = job.recruiterId && job.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to edit this job' });
  }

  const disallowed = ['_id', 'id', 'companyId', 'recruiterId', 'applicants'];
  const updates = { ...req.body };
  disallowed.forEach((field) => delete updates[field]);

  Object.assign(job, updates);
  await job.save();

  res.json(await attachCompany(job));
});

// @desc    Delete a job (owning recruiter or admin)
// @route   DELETE /api/jobs/:id
// @access  Private/Recruiter|Admin
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });

  const isOwner = job.recruiterId && job.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to delete this job' });
  }

  await job.deleteOne();
  res.json({ message: 'Job deleted' });
});

// @desc    Save a job for later
// @route   POST /api/jobs/:id/save
// @access  Private
const saveJob = asyncHandler(async (req, res) => {
  await SavedJob.findOneAndUpdate(
    { userId: req.user.id, jobId: req.params.id },
    { userId: req.user.id, jobId: req.params.id },
    { upsert: true }
  );
  res.json({ message: 'Job saved' });
});

// @desc    Unsave a job
// @route   DELETE /api/jobs/:id/save
// @access  Private
const unsaveJob = asyncHandler(async (req, res) => {
  await SavedJob.deleteOne({ userId: req.user.id, jobId: req.params.id });
  res.json({ message: 'Job removed from saved list' });
});

// @desc    Get the logged-in user's saved jobs
// @route   GET /api/jobs/saved/list
// @access  Private
const getSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ userId: req.user.id });
  const jobIds = saved.map((s) => s.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds } });
  res.json(await attachCompanyMany(jobs));
});

// @desc    Get job categories
// @route   GET /api/jobs/meta/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.categories);
});

// @desc    Get experience levels
// @route   GET /api/jobs/meta/experience-levels
// @access  Public
const getExperienceLevels = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.experienceLevels);
});

// @desc    Get jobs posted by the logged-in recruiter
// @route   GET /api/jobs/recruiter/mine
// @access  Private/Recruiter
const getRecruiterJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ recruiterId: req.user.id }).sort({ createdAt: -1 });
  res.json(await attachCompanyMany(jobs));
});

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  saveJob,
  unsaveJob,
  getSavedJobs,
  getCategories,
  getExperienceLevels,
  getRecruiterJobs,
  attachCompany,
  attachCompanyMany,
};
