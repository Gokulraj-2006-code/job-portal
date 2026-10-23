const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');

// @desc    Submit the public contact form
// @route   POST /api/contact
// @access  Public
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  await Message.create({ name, email, subject, message });
  res.status(201).json({ message: 'Your message has been sent' });
});

module.exports = { submitMessage };
