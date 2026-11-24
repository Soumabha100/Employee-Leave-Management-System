const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ============================================================
// OWNER: Soumabha
// CONTROLLER: Current Employee Profile
// ============================================================

/**
 * @desc    Get current authenticated employee profile
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res, next) => {
  // TODO: Soumabha - Return authenticated user profile (req.user)
  return res.status(200).json({
    success: true,
    message: 'Profile endpoint initialized',
    data: req.user || null,
  });
});

module.exports = {
  getProfile,
};
