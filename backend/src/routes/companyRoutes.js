const express = require('express');
const {
  getCompanies,
  getCompany,
  getCompanyJobs,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadLogo,
  removeLogo,
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.get('/:id/jobs', getCompanyJobs);

router.post('/', protect, authorize('recruiter'), createCompany);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateCompany);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteCompany);

router.post('/:id/logo', protect, authorize('recruiter', 'admin'), uploadLogo);
router.delete('/:id/logo', protect, authorize('recruiter', 'admin'), removeLogo);

module.exports = router;
