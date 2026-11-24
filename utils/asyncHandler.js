/**
 * Wraps an async Express handler to catch unhandled Promise rejections and forward them to next().
 * Compatible with Express 4 and Express 5.
 *
 * @param {Function} fn - Async Express route handler or middleware (req, res, next).
 * @returns {Function} Express middleware that invokes fn and passes errors to next.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
