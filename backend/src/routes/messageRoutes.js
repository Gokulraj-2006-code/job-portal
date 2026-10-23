const express = require('express');
const { getMessages, markMessageRead, deleteMessage } = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Shared inbox: both Admins and Recruiters use this in the frontend.
router.use(protect, authorize('admin', 'recruiter'));

router.get('/', getMessages);
router.put('/:id/read', markMessageRead);
router.delete('/:id', deleteMessage);

module.exports = router;
