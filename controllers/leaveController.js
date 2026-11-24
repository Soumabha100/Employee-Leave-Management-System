const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Leave = require('../models/Leave');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { parseDateParam, daysBetweenInclusive, startOfDay } = require('../utils/dates');
const { parsePagination, buildPaginationMeta, parseSort } = require('../utils/pagination');
const { escapeRegex, isValidObjectId, requireString } = require('../utils/validators');
const { LEAVE_TYPES, LEAVE_STATUS } = require('../config/constants');

// ============================================================
// OWNER: Souvojit
// CONTROLLER: Leave Application & History
// ============================================================

// Allow-list for sortBy query param
const SORT_ALLOWED_FIELDS = ['createdAt', 'fromDate', 'toDate', 'status', 'leaveType'];

/**
 * @desc    Apply for leave
 * @route   POST /api/leaves
 * @access  Private (Employee)
 *
 * Design decisions:
 *   - totalDays is calculated as inclusive calendar days (weekends included).
 *   - employee_id comes from req.user.id; client-sent employee_id is ignored.
 *   - status is always set to 'pending'; client-sent status is ignored.
 *   - Overlap rule: 409 if same employee has a pending/approved leave overlapping dates.
 *   - Balance check: 400 if chosen leave type balance < totalDays. No deduction here.
 */
const applyLeave = asyncHandler(async (req, res, next) => {
  // --- Pick only allowed fields from body ---
  const { leaveType, fromDate: fromDateStr, toDate: toDateStr, reason } = req.body;

  // --- Validate leaveType ---
  if (!leaveType || !LEAVE_TYPES.includes(leaveType)) {
    throw new AppError(
      `leaveType must be one of: ${LEAVE_TYPES.join(', ')}`,
      400
    );
  }

  // --- Validate and parse dates ---
  if (fromDateStr === undefined || fromDateStr === null) {
    throw new AppError('fromDate is required', 400);
  }
  if (toDateStr === undefined || toDateStr === null) {
    throw new AppError('toDate is required', 400);
  }

  const fromDate = parseDateParam(String(fromDateStr), 'fromDate');
  const toDate = parseDateParam(String(toDateStr), 'toDate');

  // toDate must not be before fromDate
  if (toDate.getTime() < fromDate.getTime()) {
    throw new AppError('toDate cannot be before fromDate', 400);
  }

  // fromDate must not be in the past
  const today = startOfDay(new Date());
  if (fromDate.getTime() < today.getTime()) {
    throw new AppError('fromDate cannot be in the past', 400);
  }

  // --- Validate reason ---
  if (reason === undefined || reason === null) {
    throw new AppError('reason is required', 400);
  }
  const validatedReason = requireString(reason, 'reason', { min: 1, max: 500 });

  // --- Calculate totalDays (inclusive calendar days) ---
  const totalDays = daysBetweenInclusive(fromDate, toDate);

  const employeeId = req.user.id;

  // --- Overlap check ---
  // A leave overlaps if: existing.fromDate <= new.toDate AND existing.toDate >= new.fromDate
  const overlapping = await Leave.findOne({
    employee_id: employeeId,
    status: { $in: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED] },
    fromDate: { $lte: toDate },
    toDate: { $gte: fromDate },
  });

  if (overlapping) {
    throw new AppError(
      'You already have a pending or approved leave that overlaps these dates',
      409
    );
  }

  // --- Balance check ---
  const balance = await LeaveBalance.findOne({ employee_id: employeeId });
  if (!balance) {
    throw new AppError('Leave balance record not found for this employee', 404);
  }

  if (balance[leaveType] < totalDays) {
    throw new AppError('Insufficient leave balance', 400);
  }

  // --- Create leave request ---
  const leave = await Leave.create({
    employee_id: employeeId,
    leaveType,
    fromDate,
    toDate,
    reason: validatedReason,
    status: LEAVE_STATUS.PENDING,
    totalDays,
  });

  return res.status(201).json({
    success: true,
    message: 'Leave application submitted successfully',
    data: { leave },
  });
});

/**
 * @desc    Get current employee's leave history
 * @route   GET /api/leaves
 * @access  Private (Employee)
 *
 * Query params: page, limit, status, leaveType, from, to, sortBy, order
 */
const getMyLeaves = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { sort } = parseSort(req.query, SORT_ALLOWED_FIELDS, 'createdAt', 'desc');

  // Build filter
  const filter = { employee_id: req.user.id };

  // --- Validate and apply status filter ---
  if (req.query.status !== undefined) {
    const validStatuses = Object.values(LEAVE_STATUS);
    if (!validStatuses.includes(req.query.status)) {
      throw new AppError(
        `Invalid status '${req.query.status}'. Allowed: ${validStatuses.join(', ')}`,
        400
      );
    }
    filter.status = req.query.status;
  }

  // --- Validate and apply leaveType filter ---
  if (req.query.leaveType !== undefined) {
    if (!LEAVE_TYPES.includes(req.query.leaveType)) {
      throw new AppError(
        `Invalid leaveType '${req.query.leaveType}'. Allowed: ${LEAVE_TYPES.join(', ')}`,
        400
      );
    }
    filter.leaveType = req.query.leaveType;
  }

  // --- Date range filter (from and to: return leaves that overlap the range) ---
  if (req.query.from !== undefined || req.query.to !== undefined) {
    if (req.query.from !== undefined) {
      const fromDate = parseDateParam(req.query.from, 'from');
      // Leaves whose toDate >= from (they extend into or past the range start)
      filter.toDate = { ...(filter.toDate || {}), $gte: fromDate };
    }
    if (req.query.to !== undefined) {
      const toDate = parseDateParam(req.query.to, 'to');
      // Leaves whose fromDate <= to (they start on or before the range end)
      filter.fromDate = { ...(filter.fromDate || {}), $lte: toDate };
    }
  }

  const [total, leaves] = await Promise.all([
    Leave.countDocuments(filter),
    Leave.find(filter).sort(sort).skip(skip).limit(limit),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      leaves,
      pagination: buildPaginationMeta(total, page, limit),
    },
  });
});

/**
 * @desc    Get all leave requests (HR / Admin view)
 * @route   GET /api/leaves/all
 * @access  Private (Admin / HR)
 *
 * Query params: page, limit, status, leaveType, employeeId, from, to,
 *               sortBy, order, q (case-insensitive search)
 */
const getAllLeaves = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { sort } = parseSort(req.query, SORT_ALLOWED_FIELDS, 'createdAt', 'desc');

  const filter = {};

  // --- Validate and apply status filter ---
  if (req.query.status !== undefined) {
    const validStatuses = Object.values(LEAVE_STATUS);
    if (!validStatuses.includes(req.query.status)) {
      throw new AppError(
        `Invalid status '${req.query.status}'. Allowed: ${validStatuses.join(', ')}`,
        400
      );
    }
    filter.status = req.query.status;
  }

  // --- Validate and apply leaveType filter ---
  if (req.query.leaveType !== undefined) {
    if (!LEAVE_TYPES.includes(req.query.leaveType)) {
      throw new AppError(
        `Invalid leaveType '${req.query.leaveType}'. Allowed: ${LEAVE_TYPES.join(', ')}`,
        400
      );
    }
    filter.leaveType = req.query.leaveType;
  }

  // --- Validate and apply employeeId filter ---
  if (req.query.employeeId !== undefined) {
    if (!isValidObjectId(req.query.employeeId)) {
      throw new AppError(`Invalid employeeId: ${req.query.employeeId}`, 400);
    }
    filter.employee_id = req.query.employeeId;
  }

  // --- Date range filter ---
  if (req.query.from !== undefined || req.query.to !== undefined) {
    if (req.query.from !== undefined) {
      const fromDate = parseDateParam(req.query.from, 'from');
      filter.toDate = { ...(filter.toDate || {}), $gte: fromDate };
    }
    if (req.query.to !== undefined) {
      const toDate = parseDateParam(req.query.to, 'to');
      filter.fromDate = { ...(filter.fromDate || {}), $lte: toDate };
    }
  }

  // --- Search: q (case-insensitive on employee name or reason) ---
  if (req.query.q !== undefined && req.query.q.trim() !== '') {
    const q = req.query.q.trim();
    const regex = new RegExp(escapeRegex(q), 'i');

    // Find users whose name matches the search query (cap at 100)
    const matchingUsers = await User.find(
      { name: regex },
      { _id: 1 }
    ).limit(100);

    const matchingUserIds = matchingUsers.map((u) => u._id);

    // $or: employee_id in matching user IDs OR reason matches the regex
    filter.$or = [
      { employee_id: { $in: matchingUserIds } },
      { reason: regex },
    ];
  }

  // Use the same filter object for both countDocuments and find
  const [total, leaves] = await Promise.all([
    Leave.countDocuments(filter),
    Leave.find(filter)
      .populate('employee_id', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      leaves,
      pagination: buildPaginationMeta(total, page, limit),
    },
  });
});

/**
 * @desc    Get a single leave request by ID
 * @route   GET /api/leaves/:id
 * @access  Private (Owner, Admin, or HR)
 */
const getLeaveById = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id).populate(
    'employee_id',
    'name email role'
  );

  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }

  // Ownership check: if not HR/admin, must be the owner
  const isOwner = leave.employee_id._id.toString() === req.user.id;
  const isPrivileged = req.user.role === 'admin' || req.user.role === 'hr';

  if (!isOwner && !isPrivileged) {
    throw new AppError('You do not have permission to view this leave request', 403);
  }

  return res.status(200).json({
    success: true,
    data: { leave },
  });
});

/**
 * @desc    Cancel (delete) own pending leave request
 * @route   DELETE /api/leaves/:id
 * @access  Private (Owner only, while status is pending)
 */
const cancelLeave = asyncHandler(async (req, res, next) => {
  const leave = await Leave.findById(req.params.id);

  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }

  // Only owner can cancel
  if (leave.employee_id.toString() !== req.user.id) {
    throw new AppError('You do not have permission to cancel this leave request', 403);
  }

  // Can only cancel pending leaves
  if (leave.status !== LEAVE_STATUS.PENDING) {
    throw new AppError(
      `Cannot cancel a leave request that is already ${leave.status}`,
      409
    );
  }

  await Leave.findByIdAndDelete(req.params.id);

  return res.status(200).json({
    success: true,
    message: 'Leave request cancelled successfully',
    data: null,
  });
});

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  cancelLeave,
};
