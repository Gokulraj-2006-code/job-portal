const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const { serialize, serializeMany } = require('../utils/serialize');
const { attachCompany } = require('./jobController');
const { withJobCount } = require('./companyController');

const addAudit = async (req, action, target) =>
  AuditLog.create({ adminId: req.user.id, adminName: req.user.name, action, target });

// ---------- Dashboard ----------

const getStats = asyncHandler(async (req, res) => {
  const [totalSeekers, totalRecruiters, totalCompanies, pendingCompanies, totalJobs, activeJobs, pendingJobs, rejectedJobs, totalApplications] =
    await Promise.all([
      User.countDocuments({ role: 'seeker' }),
      User.countDocuments({ role: 'recruiter' }),
      Company.countDocuments({}),
      Company.countDocuments({ status: 'pending' }),
      Job.countDocuments({}),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'pending' }),
      Job.countDocuments({ status: 'rejected' }),
      Application.countDocuments({}),
    ]);

  res.json({
    totalSeekers,
    totalRecruiters,
    totalCompanies,
    pendingCompanies,
    totalJobs,
    activeJobs,
    pendingJobs,
    rejectedJobs,
    totalApplications,
  });
});

const getRecentApplications = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const applications = await Application.find().sort({ appliedAt: -1 }).limit(limit);
  const result = await Promise.all(
    applications.map(async (app) => {
      const plain = serialize(app);
      const seeker = await User.findById(app.seekerId);
      const job = await Job.findById(app.jobId);
      plain.seeker = seeker ? seeker.toSafeObject() : null;
      plain.job = job ? await attachCompany(job) : null;
      return plain;
    })
  );
  res.json(result);
});

const getRecentUsers = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const users = await User.find({ role: { $ne: 'admin' } })
    .sort({ createdAt: -1 })
    .limit(limit);
  res.json(users.map((u) => u.toSafeObject()));
});

const getCompanyWiseStats = asyncHandler(async (req, res) => {
  const companies = await Company.find();
  const result = await Promise.all(
    companies.map(async (company) => {
      const jobs = await Job.find({ companyId: company._id });
      const jobIds = jobs.map((j) => j._id);
      const applicationCount = await Application.countDocuments({ jobId: { $in: jobIds } });
      return {
        id: company._id.toString(),
        name: company.name,
        status: company.status,
        jobCount: jobs.length,
        applicationCount,
      };
    })
  );
  res.json(result);
});

// ---------- Users ----------

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, status, search } = req.query;
  const query = { role: { $ne: 'admin' } };
  if (role && role !== 'All') query.role = role;
  if (status && status !== 'All') query.status = status;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  const users = await User.find(query).sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeObject()));
});

const getUserApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ seekerId: req.params.id }).sort({ appliedAt: -1 });
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

const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  await addAudit(req, status === 'blocked' ? 'Blocked user' : 'Activated user', user.name);
  res.json(user.toSafeObject());
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (user) await addAudit(req, 'Deleted user', user.name);
  res.json({ message: 'User deleted' });
});

// ---------- Companies ----------

const getAllCompanies = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = {};
  if (status && status !== 'All') query.status = status;
  if (search) query.name = { $regex: search, $options: 'i' };

  const companies = await Company.find(query);
  const result = await Promise.all(
    companies.map(async (c) => {
      const plain = serialize(c);
      plain.jobCount = await Job.countDocuments({ companyId: c._id });
      return plain;
    })
  );
  res.json(result);
});

const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create({ ...req.body, status: 'approved', recruiterId: null });
  await addAudit(req, 'Added company', company.name);
  res.status(201).json(serialize(company));
});

const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ message: 'Company not found' });
  await addAudit(req, 'Edited company', company.name);
  res.json(serialize(company));
});

const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (company) await addAudit(req, 'Deleted company', company.name);
  res.json({ message: 'Company deleted' });
});

const approveCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
  if (!company) return res.status(404).json({ message: 'Company not found' });
  await addAudit(req, 'Approved company', company.name);
  res.json({ message: 'Company approved' });
});

const rejectCompany = asyncHandler(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!company) return res.status(404).json({ message: 'Company not found' });
  await addAudit(req, 'Rejected company', company.name);
  res.json({ message: 'Company rejected' });
});

// ---------- Jobs ----------

const getAllJobs = asyncHandler(async (req, res) => {
  const { status, category, type, search } = req.query;
  const query = {};
  if (status && status !== 'All') query.status = status;
  if (category && category !== 'All') query.category = category;
  if (type && type !== 'All') query.type = type;
  if (search) query.title = { $regex: search, $options: 'i' };

  const jobs = await Job.find(query).sort({ createdAt: -1 });
  res.json(await Promise.all(jobs.map(attachCompany)));
});

const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, recruiterId: null, status: req.body.status || 'active' });
  await addAudit(req, 'Added job', job.title);
  res.status(201).json(await attachCompany(job));
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  await addAudit(req, 'Edited job', job.title);
  res.json(await attachCompany(job));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (job) await addAudit(req, 'Deleted job', job.title);
  res.json({ message: 'Job deleted' });
});

const approveJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  await addAudit(req, 'Approved job', job.title);
  res.json({ message: 'Job approved' });
});

const rejectJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
  if (!job) return res.status(404).json({ message: 'Job not found' });
  await addAudit(req, 'Rejected job', job.title);
  res.json({ message: 'Job rejected' });
});

// ---------- Applications ----------

const getAllApplications = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const query = {};
  if (status && status !== 'All') query.status = status;

  const applications = await Application.find(query).sort({ appliedAt: -1 });
  let result = await Promise.all(
    applications.map(async (app) => {
      const plain = serialize(app);
      const seeker = await User.findById(app.seekerId);
      const job = await Job.findById(app.jobId);
      plain.seeker = seeker ? seeker.toSafeObject() : null;
      plain.job = job ? await attachCompany(job) : null;
      return plain;
    })
  );

  if (search) {
    const needle = String(search).toLowerCase();
    result = result.filter((app) => {
      const applicantName = (app.fullName || app.seeker?.name || '').toLowerCase();
      const applicantEmail = (app.email || app.seeker?.email || '').toLowerCase();
      const jobTitle = (app.job?.title || '').toLowerCase();
      const companyName = (app.job?.company?.name || '').toLowerCase();
      return (
        applicantName.includes(needle) ||
        applicantEmail.includes(needle) ||
        jobTitle.includes(needle) ||
        companyName.includes(needle)
      );
    });
  }

  res.json(result);
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!application) return res.status(404).json({ message: 'Application not found' });
  await addAudit(req, 'Updated application status', status);
  res.json(serialize(application));
});

const addApplicationNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found' });

  application.internalNotes.unshift({ text: note, addedAt: new Date(), adminName: req.user.name });
  await application.save();
  await addAudit(req, 'Added application note', application.jobId.toString());
  res.json(serialize(application));
});

// ---------- Audit Log ----------

const getAuditLog = asyncHandler(async (req, res) => {
  const log = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  res.json(serializeMany(log));
});

// ---------- Site Settings ----------

const getAnnouncement = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.announcement);
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  settings.announcement = { ...req.body, updatedAt: new Date() };
  await settings.save();
  await addAudit(req, 'Updated website announcement', String(req.body.message || '').slice(0, 40));
  res.json(settings.announcement);
});

const getCategories = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.categories);
});

const addCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const settings = await Settings.getSingleton();
  if (settings.categories.some((c) => c.toLowerCase() === String(name).toLowerCase())) {
    return res.status(400).json({ message: 'This category already exists' });
  }
  settings.categories.push(name);
  await settings.save();
  await addAudit(req, 'Added job category', name);
  res.json(settings.categories);
});

const deleteCategory = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  settings.categories = settings.categories.filter((c) => c !== req.params.name);
  await settings.save();
  await addAudit(req, 'Removed job category', req.params.name);
  res.json(settings.categories);
});

const getExperienceLevels = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.experienceLevels);
});

const addExperienceLevel = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const settings = await Settings.getSingleton();
  if (settings.experienceLevels.some((l) => l.toLowerCase() === String(name).toLowerCase())) {
    return res.status(400).json({ message: 'This experience level already exists' });
  }
  settings.experienceLevels.push(name);
  await settings.save();
  await addAudit(req, 'Added experience level', name);
  res.json(settings.experienceLevels);
});

const deleteExperienceLevel = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  settings.experienceLevels = settings.experienceLevels.filter((l) => l !== req.params.name);
  await settings.save();
  await addAudit(req, 'Removed experience level', req.params.name);
  res.json(settings.experienceLevels);
});

const getSalarySettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  res.json(settings.salarySettings);
});

const updateSalarySettings = asyncHandler(async (req, res) => {
  const settings = await Settings.getSingleton();
  settings.salarySettings = req.body;
  await settings.save();
  await addAudit(
    req,
    'Updated salary settings',
    `${req.body.currencySymbol || ''} ${req.body.minSalary || ''}-${req.body.maxSalary || ''}`
  );
  res.json(settings.salarySettings);
});

module.exports = {
  getStats,
  getRecentApplications,
  getRecentUsers,
  getCompanyWiseStats,
  getAllUsers,
  getUserApplications,
  updateUserStatus,
  deleteUser,
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  approveCompany,
  rejectCompany,
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  approveJob,
  rejectJob,
  getAllApplications,
  updateApplicationStatus,
  addApplicationNote,
  getAuditLog,
  getAnnouncement,
  updateAnnouncement,
  getCategories,
  addCategory,
  deleteCategory,
  getExperienceLevels,
  addExperienceLevel,
  deleteExperienceLevel,
  getSalarySettings,
  updateSalarySettings,
};
