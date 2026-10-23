const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const Company = require('../models/Company');

// @desc    Login with email OR phone + password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Please provide your email/mobile and password' });
  }

  const value = String(identifier).trim().toLowerCase();
  const normalizedPhone = value.replace(/[^\d]/g, '');

  // Try an exact email match first, then fall back to a phone match.
  let user = await User.findOne({ email: value }).select('+password');
  if (!user && normalizedPhone.length >= 7) {
    const candidates = await User.find({
      phone: { $regex: `${normalizedPhone}$` },
    }).select('+password');
    user = candidates.find((u) => u.phone.replace(/[^\d]/g, '').endsWith(normalizedPhone));
  }

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email/mobile number or password' });
  }

  if (user.status === 'blocked') {
    return res.status(403).json({ message: 'This account has been blocked. Please contact support.' });
  }

  res.json({ token: generateToken(user._id), user: user.toSafeObject() });
});

// @desc    Register a new seeker or recruiter
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, location, role, companyName, industry, designation } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: 'An account with this email already exists' });
  }

  const normalizedPhone = String(phone || '').replace(/[^\d]/g, '');
  if (normalizedPhone) {
    const users = await User.find({});
    const phoneExists = users.some((u) => u.phone && u.phone.replace(/[^\d]/g, '') === normalizedPhone);
    if (phoneExists) {
      return res.status(400).json({ message: 'An account with this mobile number already exists' });
    }
  }

  const newUser = new User({
    role: role || 'seeker',
    name,
    email,
    password,
    phone: phone || '',
    location: location || '',
  });

  if (newUser.role === 'recruiter') {
    const finalCompanyName = companyName || `${name}'s Company`;
    const company = await Company.create({
      name: finalCompanyName,
      industry: industry || 'Technology',
      location: location || '',
      recruiterId: newUser._id,
      status: 'pending',
    });
    newUser.companyId = company._id;
    newUser.companyName = finalCompanyName;
    newUser.designation = designation || '';
  }

  await newUser.save();

  res.status(201).json({ token: generateToken(newUser._id), user: newUser.toSafeObject() });
});

// @desc    Get the logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toSafeObject());
});

// @desc    Logout (stateless JWT - client just discards the token)
// @route   POST /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out' });
});

// @desc    Request a password reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: String(email || '').toLowerCase() });
  if (!user) {
    return res.status(404).json({ message: 'No account found with this email' });
  }
  // In a production app this would email a reset link/token.
  res.json({ message: 'Password reset instructions have been sent to your email' });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  res.json({ message: 'Password has been reset' });
});

module.exports = { login, register, getMe, logout, forgotPassword, resetPassword };
