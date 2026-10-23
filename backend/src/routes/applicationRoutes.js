const express = require('express');
const { updateApplicationStatus, withdrawApplication } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.put('/:id/status', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.delete('/:id', protect, authorize('seeker'), withdrawApplication);

module.exports = router;
