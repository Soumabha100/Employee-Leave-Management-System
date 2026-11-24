const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Leave = require('../models/Leave');

// ============================================================
// OWNER: Sohan
// CONTROLLER: Leave Review & Approvals (HR / Admin)
// ============================================================

// NOTE: getAllLeaves has been moved to leaveController.js (Souvojit's controller)
// to consolidate leave query logic and ensure /all is defined before /:id.

/**
 * @desc    Approve a pending leave request and deduct balance
 * @route   PUT /api/leaves/:id/approve
 * @access  Private (Admin / HR)
 */
const approveLeave = asyncHandler(async (req, res, next) => {
  // TODO: Sohan - Approve leave and deduct days from LeaveBalance
  return res.status(200).json({
    success: true,
    message: 'Approve leave endpoint initialized',
    data: null,
  });
});

/**
 * @desc    Reject a pending leave request
 * @route   PUT /api/leaves/:id/reject
 * @access  Private (Admin / HR)
 */
const rejectLeave = asyncHandler(async (req, res, next) => {
  // TODO: Sohan - Reject leave request
  return res.status(200).json({
    success: true,
    message: 'Reject leave endpoint initialized',
    data: null,
  });
});

module.exports = {
  approveLeave,
  rejectLeave,
};
