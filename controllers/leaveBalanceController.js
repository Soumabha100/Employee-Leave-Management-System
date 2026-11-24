const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const LeaveBalance = require('../models/LeaveBalance');

// ============================================================
// OWNER: Sohan
// CONTROLLER: Leave Balance
// ============================================================

/**
 * @desc    Get current employee leave balance
 * @route   GET /api/leave-balance
 * @access  Private (Employee)
 */
const getLeaveBalance = asyncHandler(async (req, res, next) => {
  // TODO: Sohan - Retrieve employee's leave balance
  return res.status(200).json({
    success: true,
    message: 'Leave balance endpoint initialized',
    data: null,
  });
});

module.exports = {
  getLeaveBalance,
};
