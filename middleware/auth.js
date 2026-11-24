const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyToken } = require('../utils/token');
const User = require('../models/User');

// ============================================================
// OWNER: Soumabha
// MIDDLEWARE: Authentication (protect)
// ============================================================

/**
 * Protect middleware: validates Bearer token in Authorization header,
 * checks user existence in database, and sets req.user.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @throws {AppError} 401 if header missing, invalid format, expired, or user not found.
 */
const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new AppError('Authentication required', 401);
  }

  // verifyToken will let JsonWebTokenError and TokenExpiredError bubble to errorHandler
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  req.user = {
    id: user._id.toString(),
    role: user.role,
    name: user.name,
    email: user.email,
  };

  next();
});

module.exports = {
  protect,
};
