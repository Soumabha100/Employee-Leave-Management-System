const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Leave = require('../models/Leave');

// ============================================================
// OWNER: Souvojit
// CONTROLLER: Leave Application & History
// ============================================================

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee)
 */
const applyLeave = asyncHandler(async (req, res, next) => {
  // TODO: Souvojit - Validate dates, balance, and create pending leave request
  return res.status(201).json({
    success: true,
    message: 'Apply leave endpoint initialized',
    data: null,
  });
});

/**
 * @desc    Get current employee's leave history
 * @route   GET /api/leaves
 * @access  Private (Employee)
 */
const getMyLeaves = asyncHandler(async (req, res, next) => {
  // TODO: Souvojit - Return employee's own leave applications
  return res.status(200).json({
    success: true,
    message: 'Leave history endpoint initialized',
    data: [],
  });
});

module.exports = {
  applyLeave,
  getMyLeaves,
};
