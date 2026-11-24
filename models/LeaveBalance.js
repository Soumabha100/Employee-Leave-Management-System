const mongoose = require('mongoose');
const { DEFAULT_BALANCES } = require('../config/constants');

// ============================================================
// OWNER: Sohan
// MODEL: LeaveBalance
// SPECIFICATION:
// - employee_id: required User ObjectId reference (unique)
// - sick: number min:0 (default 10)
// - casual: number min:0 (default 8)
// - annual: number min:0 (default 15)
// ============================================================

const leaveBalanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
      unique: true,
    },
    sick: {
      type: Number,
      default: DEFAULT_BALANCES.sick,
      min: [0, 'Sick leave balance cannot be negative'],
    },
    casual: {
      type: Number,
      default: DEFAULT_BALANCES.casual,
      min: [0, 'Casual leave balance cannot be negative'],
    },
    annual: {
      type: Number,
      default: DEFAULT_BALANCES.annual,
      min: [0, 'Annual leave balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
