const express = require('express');
const Settings = require('../models/Settings');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// @desc    Get the public site announcement (used by the header banner
//          on every page - no auth required, unlike /api/admin/announcement)
// @route   GET /api/settings/announcement
// @access  Public
router.get(
  '/announcement',
  asyncHandler(async (req, res) => {
    const settings = await Settings.getSingleton();
    res.json(settings.announcement);
  })
);

module.exports = router;
