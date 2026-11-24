const mongoose = require('mongoose');
const AppError = require('./AppError');

/**
 * Escapes regex special characters in a string for safe use in RegExp.
 *
 * @param {string} text - String to escape.
 * @returns {string} Escaped string.
 */
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Validates whether an input is a valid 24-character hexadecimal MongoDB ObjectId string.
 * Rejects objects, arrays, and invalid length/format strings.
 *
 * @param {*} id - Value to check.
 * @returns {boolean} True if id is a valid 24-hex-char ObjectId string, false otherwise.
 */
const isValidObjectId = (id) => {
  return (
    typeof id === 'string' &&
    id.length === 24 &&
    /^[0-9a-fA-F]{24}$/.test(id) &&
    mongoose.isValidObjectId(id)
  );
};

/**
 * Express middleware factory to validate a route parameter as a MongoDB ObjectId.
 *
 * @param {string} [paramName='id'] - Name of route parameter to validate (from req.params).
 * @returns {Function} Express middleware that calls next() or next(AppError 400).
 */
const validateObjectId = (paramName = 'id') => (req, res, next) => {
  const paramVal = req.params[paramName];
  if (!isValidObjectId(paramVal)) {
    return next(new AppError(`Invalid ${paramName}: ${paramVal}`, 400));
  }
  next();
};

/**
 * Validates and trims a required string value, enforcing length bounds and blocking non-string types.
 *
 * @param {*} value - Value to validate.
 * @param {string} name - Field name for error reporting.
 * @param {object} [options={}] - Options object.
 * @param {number} [options.min=1] - Minimum length after trimming.
 * @param {number} [options.max=500] - Maximum length after trimming.
 * @returns {string} Trimmed string value.
 * @throws {AppError} 400 if value is not a string or fails min/max length constraints.
 */
const requireString = (value, name, { min = 1, max = 500 } = {}) => {
  if (typeof value !== 'string') {
    throw new AppError(`${name} must be a string`, 400);
  }
  const trimmed = value.trim();
  if (trimmed.length < min) {
    throw new AppError(
      `${name} must be at least ${min} character${min === 1 ? '' : 's'} long`,
      400
    );
  }
  if (trimmed.length > max) {
    throw new AppError(`${name} must not exceed ${max} characters`, 400);
  }
  return trimmed;
};

module.exports = {
  escapeRegex,
  isValidObjectId,
  validateObjectId,
  requireString,
};
