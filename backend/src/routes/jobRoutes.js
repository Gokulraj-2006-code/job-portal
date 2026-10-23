const express = require('express');
const {
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
} = require('../controllers/jobController');
const {
  applyToJob,
  getMyApplications,
  getJobApplicants,
  getRecruiterApplications,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ---------- Public ----------
router.get('/', getJobs);
router.get('/meta/categories', getCategories);
router.get('/meta/experience-levels', getExperienceLevels);

// ---------- Private (seeker) ----------
router.get('/saved/list', protect, getSavedJobs);
router.get('/applications/me', protect, getMyApplications);

// ---------- Private (recruiter) ----------
router.get('/recruiter/mine', protect, authorize('recruiter'), getRecruiterJobs);
router.get('/recruiter/applications', protect, authorize('recruiter'), getRecruiterApplications);

// ---------- Public (dynamic, must come after the static routes above) ----------
router.get('/:id', getJob);

// ---------- Private (create/update/delete) ----------
router.post('/', protect, authorize('recruiter'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// ---------- Private (apply / save / applicants) ----------
router.post('/:id/apply', protect, authorize('seeker'), applyToJob);
router.post('/:id/save', protect, saveJob);
router.delete('/:id/save', protect, unsaveJob);
router.get('/:id/applicants', protect, authorize('recruiter', 'admin'), getJobApplicants);

module.exports = router;
