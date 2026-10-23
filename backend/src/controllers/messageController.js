const asyncHandler = require('../utils/asyncHandler');
const Message = require('../models/Message');
const { serializeMany } = require('../utils/serialize');

// These endpoints back both the Admin Messages page and the Recruiter
// Messages page in the frontend - both read/manage the same contact
// inbox, so access is allowed for either role (enforced in the route).

// @desc    List contact messages
// @route   GET /api/messages
// @access  Private/Admin|Recruiter
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find().sort({ createdAt: -1 });
  res.json(serializeMany(messages));
});

// @desc    Mark a message read
// @route   PUT /api/messages/:id/read
// @access  Private/Admin|Recruiter
const markMessageRead = asyncHandler(async (req, res) => {
  await Message.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ message: 'Marked as read' });
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin|Recruiter
const deleteMessage = asyncHandler(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ message: 'Message deleted' });
});

module.exports = { getMessages, markMessageRead, deleteMessage };
