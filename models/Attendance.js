const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

// ============================================================
// OWNER: Soumyajit
// MODEL: Attendance
// SPECIFICATION:
// - employee_id: required User ObjectId reference
// - date: required date (start of day)
// - checkIn: required date/time
// - checkOut: nullable date/time
// - status: enum ('present', 'late', 'absent')
// ============================================================

const attendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in time is required'],
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.LATE, ATTENDANCE_STATUS.ABSENT],
      default: ATTENDANCE_STATUS.PRESENT,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate check-in for the same user on the same date
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
