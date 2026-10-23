const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeObject());
});

const updateProfile = asyncHandler(async (req, res) => {
  const disallowed = ['password', 'email', 'role', 'status', '_id', 'id', 'companyId'];
  const updates = { ...req.body };
  disallowed.forEach((field) => delete updates[field]);

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  res.json(user.toSafeObject());
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No resume file uploaded' });
  }
  const resumeMeta = {
    name: req.file.originalname,
    size: req.file.size,
    url: `/uploads/resumes/${req.file.filename}`,
    uploadedAt: new Date(),
  };
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { resume: resumeMeta },
    { new: true }
  );
  res.json(user.toSafeObject());
});

const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { resume: null }, { new: true });
  res.json(user.toSafeObject());
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ message: 'No image data provided' });
  }
  const user = await User.findByIdAndUpdate(req.user.id, { avatar }, { new: true });
  res.json(user.toSafeObject());
});

const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { avatar: '' }, { new: true });
  res.json(user.toSafeObject());
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }
  const user = await User.findById(req.user.id).select('+password');
  const matches = await user.comparePassword(currentPassword);
  if (!matches) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: 'Account deleted' });
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(notifications);
});

const markNotificationRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { read: true });
  res.json({ message: 'Notification marked as read' });
});

module.exports = {
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
};
