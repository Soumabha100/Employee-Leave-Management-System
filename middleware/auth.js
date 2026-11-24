const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// ============================================================
// OWNER: Soumabha
// MIDDLEWARE: Authentication & Role Authorization
// ============================================================

/**
 * Protect middleware: validates Bearer JWT token from Authorization header
 * and attaches authenticated user to req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Authentication token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', 401));
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Authorize middleware: restricts access to specified roles.
 *
 * @param  {...string} roles - Permitted user roles (e.g. 'admin', 'hr').
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
