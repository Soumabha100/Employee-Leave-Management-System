const AppError = require('../utils/AppError');

/**
 * Global 4-argument Express error handling middleware.
 * Formats errors according to the standard API response contract.
 *
 * @param {Error} err - Error object passed through next(err).
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {object} Formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errors = undefined;
  let isOperational = false;

  if (err instanceof AppError || err.isOperational) {
    statusCode = err.statusCode || 500;
    message = err.message;
    errors = err.errors;
    isOperational = true;
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.keys(err.errors).map((key) => ({
      field: key,
      message: err.errors[key].message,
    }));
    isOperational = true;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
    isOperational = true;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    message = `${field} already exists`;
    isOperational = true;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    isOperational = true;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    isOperational = true;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Malformed JSON body';
    isOperational = true;
  }

  if (!isOperational) {
    console.error(err.stack || err);
  }

  const responseBody = {
    success: false,
    message,
  };

  if (errors && Array.isArray(errors) && errors.length > 0) {
    responseBody.errors = errors;
  }

  return res.status(statusCode).json(responseBody);
};

module.exports = errorHandler;
