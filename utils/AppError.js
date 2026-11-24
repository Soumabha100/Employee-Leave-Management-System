/**
 * Custom application error class representing operational HTTP errors.
 *
 * @class AppError
 * @extends Error
 * @param {string} message - Human-readable error description.
 * @param {number} statusCode - HTTP status code (e.g. 400, 401, 403, 404, 500).
 * @param {Array<{field: string, message: string}>} [errors] - Optional array of field-level validation errors.
 */
class AppError extends Error {
  constructor(message, statusCode, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    if (errors !== undefined) {
      this.errors = errors;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
