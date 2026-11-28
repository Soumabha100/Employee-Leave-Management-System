const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Attendance = require('../models/Attendance');
const { ATTENDANCE_STATUS, OFFICE_START } = require('../config/constants');
const { startOfDay, minutesSinceMidnight, parseDateParam } = require('../utils/dates');
const { parsePagination, buildPaginationMeta, parseSort } = require('../utils/pagination');
const { isValidObjectId } = require('../utils/validators');

// ============================================================
// OWNER: Soumyajit
// CONTROLLER: Attendance Management
// ============================================================

const SORT_ALLOWED_FIELDS = ['date', 'checkIn', 'checkOut', 'status'];

/**
 * @desc    Employee check-in for current day
 * @route   POST /api/attendance/check-in
 * @access  Private (Employee / Authenticated User)
 *
 * Rules:
 *   - No body needed.
 *   - employee_id = req.user.id
 *   - date = startOfDay(now) (00:00:00.000 UTC in Asia/Kolkata timezone)
 *   - checkIn = now
 *   - status = 'late' if minutesSinceMidnight(now) > OFFICE_START (09:30), else 'present'
 *   - Existing record for today returns 409 "Already checked in today"
 *   - Catches Mongo error code 11000 and returns 409 "Already checked in today"
 *   - Returns 201 Created
 */
const checkIn = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const today = startOfDay(now);
  const employeeId = req.user.id;

  // Pre-check for duplicate check-in today
  const existingRecord = await Attendance.findOne({
    employee_id: employeeId,
    date: today,
  });

  if (existingRecord) {
    throw new AppError('Already checked in today', 409);
  }

  // Calculate status: late if after 09:30 AM in configured timezone
  const officeStartMinutes = OFFICE_START.hour * 60 + OFFICE_START.minute;
  const currentMinutes = minutesSinceMidnight(now);
  const status =
    currentMinutes > officeStartMinutes
      ? ATTENDANCE_STATUS.LATE
      : ATTENDANCE_STATUS.PRESENT;

  try {
    const attendance = await Attendance.create({
      employee_id: employeeId,
      date: today,
      checkIn: now,
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Check-in successful',
      data: { attendance },
    });
  } catch (err) {
    // Catch race condition duplicate key errors (code 11000)
    if (err.code === 11000) {
      throw new AppError('Already checked in today', 409);
    }
    throw err;
  }
});

/**
 * @desc    Employee check-out for current day
 * @route   PUT /api/attendance/check-out
 * @access  Private (Employee / Authenticated User)
 *
 * Rules:
 *   - Finds today's record for req.user.id
 *   - If no record found: returns 404 "No check-in found for today"
 *   - If record already has checkOut: returns 409 "Already checked out today"
 *   - Validates that checkOut is not earlier than checkIn
 *   - Sets checkOut = now and saves
 *   - Returns 200 OK with updated record
 */
const checkOut = asyncHandler(async (req, res, next) => {
  const now = new Date();
  const today = startOfDay(now);
  const employeeId = req.user.id;

  const attendance = await Attendance.findOne({
    employee_id: employeeId,
    date: today,
  });

  if (!attendance) {
    throw new AppError('No check-in found for today', 404);
  }

  if (attendance.checkOut) {
    throw new AppError('Already checked out today', 409);
  }

  if (now.getTime() < attendance.checkIn.getTime()) {
    throw new AppError('Check-out time cannot be earlier than check-in time', 400);
  }

  attendance.checkOut = now;
  await attendance.save();

  return res.status(200).json({
    success: true,
    message: 'Check-out successful',
    data: { attendance },
  });
});

/**
 * @desc    Get attendance records with date pagination and filtering
 * @route   GET /api/attendance
 * @access  Private (Employee views own; HR/Admin may view specific employeeId)
 *
 * Query params:
 *   - page, limit (max 100, defaults 1, 10)
 *   - from, to as YYYY-MM-DD
 *   - status (present, late, absent)
 *   - sortBy (date, checkIn, checkOut, status; order asc/desc, default date desc)
 *   - employeeId (optional, HR/Admin only; ignored for employees who only see own)
 */
const getAttendance = asyncHandler(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { sort } = parseSort(req.query, SORT_ALLOWED_FIELDS, 'date', 'desc');

  // Build filter starting from employee scope
  let targetEmployeeId = req.user.id;
  if (req.query.employeeId !== undefined) {
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      if (!isValidObjectId(req.query.employeeId)) {
        throw new AppError(`Invalid employeeId: ${req.query.employeeId}`, 400);
      }
      targetEmployeeId = req.query.employeeId;
    }
    // If not HR/admin, targetEmployeeId strictly remains req.user.id
  }

  const filter = { employee_id: targetEmployeeId };

  // Date range filter (from / to)
  let fromDate;
  let toDate;

  if (req.query.from !== undefined) {
    fromDate = parseDateParam(req.query.from, 'from');
  }

  if (req.query.to !== undefined) {
    toDate = parseDateParam(req.query.to, 'to');
  }

  if (fromDate && toDate && fromDate.getTime() > toDate.getTime()) {
    throw new AppError('from date cannot be after to date', 400);
  }

  if (fromDate && toDate) {
    filter.date = { $gte: fromDate, $lte: toDate };
  } else if (fromDate) {
    filter.date = { $gte: fromDate };
  } else if (toDate) {
    filter.date = { $lte: toDate };
  }

  // Status filter
  if (req.query.status !== undefined) {
    const validStatuses = Object.values(ATTENDANCE_STATUS);
    if (!validStatuses.includes(req.query.status)) {
      throw new AppError(
        `Invalid status '${req.query.status}'. Allowed: ${validStatuses.join(', ')}`,
        400
      );
    }
    filter.status = req.query.status;
  }

  // Use the exact same filter object for countDocuments and find
  const [total, attendanceRecords] = await Promise.all([
    Attendance.countDocuments(filter),
    Attendance.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  return res.status(200).json({
    success: true,
    data: {
      attendance: attendanceRecords,
      pagination: buildPaginationMeta(total, page, limit),
    },
  });
});

module.exports = {
  checkIn,
  checkOut,
  getAttendance,
};
