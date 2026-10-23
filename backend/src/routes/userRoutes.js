const express = require('express');
const {
  getProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  deleteAccount,
  getNotifications,
  markNotificationRead,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadResume: uploadResumeMiddleware } = require('../middleware/upload');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.post('/resume', uploadResumeMiddleware.single('resume'), uploadResume);
router.delete('/resume', deleteResume);

router.post('/avatar', uploadAvatar);
router.delete('/avatar', deleteAvatar);

router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);

router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);

module.exports = router;
