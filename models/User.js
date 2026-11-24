const mongoose = require('mongoose');
const { ROLES } = require('../config/constants');

// ============================================================
// OWNER: Soumabha
// MODEL: User
// SPECIFICATION:
// - name: required string
// - email: required unique string
// - password: required string (hashed using bcrypt)
// - role: enum ('admin', 'hr', 'employee'), default 'employee'
// ============================================================

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
      default: ROLES.EMPLOYEE,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
