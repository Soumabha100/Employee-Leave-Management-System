const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// ============================================================
// OWNER: Soumabha
// CONTROLLER: Current Employee Profile
// ============================================================

/**
 * Retrieves authenticated employee profile re-read from database.
 * No passwords or sensitive tokens returned.
 *
 * @route   GET /api/profile
 * @access  Private (Authenticated User)
 */
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

module.exports = {
  getProfile,
};
