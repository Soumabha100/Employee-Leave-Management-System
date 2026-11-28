const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../config/constants');

// ============================================================
// OWNER: Soumyajit
// MODEL: Attendance
// SPECIFICATION:
// - employee_id: required User ObjectId reference
// - date: required date (00:00:00 UTC start of day)
// - checkIn: required date/time
// - checkOut: nullable date/time (default null)
// - status: enum ('present', 'late', 'absent'), default 'present'
//
// INDEXES:
// 1. Unique compound index: { employee_id: 1, date: 1 } (prevents duplicate daily check-ins)
// 2. Query index: { employee_id: 1, date: -1 } (optimizes descending attendance history queries)
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
      enum: {
        values: [
          ATTENDANCE_STATUS.PRESENT,
          ATTENDANCE_STATUS.LATE,
          ATTENDANCE_STATUS.ABSENT,
        ],
        message: '{VALUE} is not a valid attendance status',
      },
      default: ATTENDANCE_STATUS.PRESENT,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate check-in for the same user on the same date (unique)
attendanceSchema.index({ employee_id: 1, date: 1 }, { unique: true });

// Optimize personal listing queries sorted by date descending
attendanceSchema.index({ employee_id: 1, date: -1 });

attendanceSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Attendance', attendanceSchema);
