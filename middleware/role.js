const AppError = require('../utils/AppError');

// ============================================================
// OWNER: Soumabha
// MIDDLEWARE: Role-Based Authorization (authorize)
// ============================================================

/**
 * Authorize middleware factory: restricts route access to specified roles.
 *
 * @param {...string} allowedRoles - Permitted user roles (e.g. 'admin', 'hr').
 * @returns {Function} Express middleware function checking req.user.role.
 * @throws {AppError} 401 if req.user is missing, 403 if user role is not authorized.
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
