const mongoose = require('mongoose');
const { LEAVE_TYPES, LEAVE_STATUS } = require('../config/constants');

// ============================================================
// OWNER: Souvojit
// MODEL: Leave
// SPECIFICATION:
// - employee_id: required User ObjectId reference
// - leaveType: enum ('sick', 'casual', 'annual')
// - fromDate: required date
// - toDate: required date
// - reason: required string (max 500 chars)
// - status: enum ('pending', 'approved', 'rejected'), default 'pending'
// - totalDays: server-calculated inclusive calendar days
// - reviewedBy: ObjectId ref to User (HR/Admin who reviewed)
// - reviewedAt: Date when review happened
// - rejectionReason: string (reason for rejection)
// ============================================================

const leaveSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    leaveType: {
      type: String,
      enum: LEAVE_TYPES,
      required: [true, 'Leave type is required'],
    },
    fromDate: {
      type: Date,
      required: [true, 'From date is required'],
    },
    toDate: {
      type: Date,
      required: [true, 'To date is required'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      maxlength: [500, 'Reason must not exceed 500 characters'],
    },
    status: {
      type: String,
      enum: [LEAVE_STATUS.PENDING, LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED],
      default: LEAVE_STATUS.PENDING,
    },
    totalDays: {
      type: Number,
      required: [true, 'Total days is required'],
      min: [1, 'Total days must be at least 1'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
leaveSchema.index({ employee_id: 1, fromDate: 1 });
leaveSchema.index({ status: 1, createdAt: 1 });

leaveSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Leave', leaveSchema);
