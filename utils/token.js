const jwt = require('jsonwebtoken');

// ============================================================
// OWNER: Soumabha
// HELPER: JWT Token Generation & Verification
// ============================================================

/**
 * Signs a JWT with user id and role payload.
 *
 * @param {object} user - User document or object with id/_id and role.
 * @returns {string} Signed JWT string.
 */
const signToken = (user) => {
  const userId = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { id: userId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
};

/**
 * Verifies and decodes a JWT token.
 * Lets JsonWebTokenError and TokenExpiredError bubble up to errorHandler.
 *
 * @param {string} token - Raw JWT token string.
 * @returns {object} Decoded token payload.
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError} If token is invalid or expired.
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};
