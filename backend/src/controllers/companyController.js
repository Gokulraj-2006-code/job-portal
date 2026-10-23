const asyncHandler = require('../utils/asyncHandler');
const Company = require('../models/Company');
const Job = require('../models/Job');
const User = require('../models/User');
const { serialize, serializeMany } = require('../utils/serialize');
const { attachCompanyMany } = require('./jobController');

const withJobCount = async (company) => {
  const plain = serialize(company);
  plain.jobCount = await Job.countDocuments({ companyId: plain.id, status: 'active' });
  return plain;
};

const withJobCountMany = async (companies) => Promise.all(companies.map(withJobCount));

// @desc    List approved companies
// @route   GET /api/companies
// @access  Public
const getCompanies = asyncHandler(async (req, res) => {
  const companies = await Company.find({ status: 'approved' });
  res.json(await withJobCountMany(companies));
});

// @desc    Get one company
// @route   GET /api/companies/:id
// @access  Public
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });
  res.json(await withJobCount(company));
});

// @desc    Get active jobs for a company
// @route   GET /api/companies/:id/jobs
// @access  Public
const getCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ companyId: req.params.id, status: 'active' });
  res.json(await attachCompanyMany(jobs));
});

// @desc    Create a company profile (recruiter)
// @route   POST /api/companies
// @access  Private/Recruiter
const createCompany = asyncHandler(async (req, res) => {
  const company = await Company.create({ ...req.body, recruiterId: req.user.id, status: 'pending' });

  // Link the new company back onto the recruiter's account.
  await User.findByIdAndUpdate(req.user.id, { companyId: company._id, companyName: company.name });

  res.status(201).json(await withJobCount(company));
});

// @desc    Update a company (owning recruiter or admin)
// @route   PUT /api/companies/:id
// @access  Private/Recruiter|Admin
const updateCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const isOwner = company.recruiterId && company.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to edit this company' });
  }

  const disallowed = ['_id', 'id', 'recruiterId', 'status'];
  const updates = { ...req.body };
  disallowed.forEach((field) => delete updates[field]);

  Object.assign(company, updates);
  await company.save();

  if (isOwner) {
    await User.findByIdAndUpdate(req.user.id, { companyName: company.name });
  }

  res.json(await withJobCount(company));
});

// @desc    Delete a company
// @route   DELETE /api/companies/:id
// @access  Private/Recruiter|Admin
const deleteCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const isOwner = company.recruiterId && company.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to delete this company' });
  }

  await company.deleteOne();
  res.json({ message: 'Company deleted' });
});

// @desc    Upload/replace a company logo (base64 data URL)
// @route   POST /api/companies/:id/logo
// @access  Private/Recruiter|Admin
const uploadLogo = asyncHandler(async (req, res) => {
  const { logo } = req.body;
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const isOwner = company.recruiterId && company.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to edit this company' });
  }

  company.logo = logo || '';
  await company.save();
  res.json(await withJobCount(company));
});

// @desc    Remove a company logo
// @route   DELETE /api/companies/:id/logo
// @access  Private/Recruiter|Admin
const removeLogo = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) return res.status(404).json({ message: 'Company not found' });

  const isOwner = company.recruiterId && company.recruiterId.toString() === req.user.id;
  if (req.user.role !== 'admin' && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to edit this company' });
  }

  company.logo = '';
  await company.save();
  res.json(await withJobCount(company));
});

module.exports = {
  getCompanies,
  getCompany,
  getCompanyJobs,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadLogo,
  removeLogo,
  withJobCount,
  withJobCountMany,
};
