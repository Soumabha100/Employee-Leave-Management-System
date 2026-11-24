const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../config/constants');

// ============================================================
// OWNER: Soumabha
// MODEL: User
// ============================================================

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [100, 'Email cannot exceed 100 characters'],
      match: [emailRegex, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: [ROLES.ADMIN, ROLES.HR, ROLES.EMPLOYEE],
        message: '{VALUE} is not a valid role',
      },
      default: ROLES.EMPLOYEE,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook: Hash password with bcryptjs (10 salt rounds) if modified.
 */
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Compare candidate password against stored bcrypt hash.
 * Only works when password field was selected.
 *
 * @param {string} plainPassword - Plaintext password to compare.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.password) {
    throw new Error('Password field not selected on User instance');
  }
  return bcrypt.compare(plainPassword, this.password);
};

/**
 * Sanitize output by removing password and __v when converted to JSON.
 */
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
