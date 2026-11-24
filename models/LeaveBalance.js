const mongoose = require('mongoose');
const { DEFAULT_BALANCES } = require('../config/constants');

// ============================================================
// OWNER: Sohan (Maintained in Phase 2 for Registration Orchestration)
// MODEL: LeaveBalance
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
      required: true,
      default: DEFAULT_BALANCES.sick,
      min: [0, 'Sick leave balance cannot be negative'],
    },
    casual: {
      type: Number,
      required: true,
      default: DEFAULT_BALANCES.casual,
      min: [0, 'Casual leave balance cannot be negative'],
    },
    annual: {
      type: Number,
      required: true,
      default: DEFAULT_BALANCES.annual,
      min: [0, 'Annual leave balance cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

leaveBalanceSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
