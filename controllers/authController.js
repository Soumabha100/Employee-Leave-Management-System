const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { requireString } = require('../utils/validators');
const { signToken } = require('../utils/token');
const { ROLES, DEFAULT_BALANCES } = require('../config/constants');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');

// ============================================================
// OWNER: Soumabha
// CONTROLLER: Authentication (Register & Login)
// ============================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = '$2b$10$3o0leEQ8VaF.Du0Q3TgKmu6w7H986vS4qr9l3oUBtuzvir122wVDO';

/**
 * Register a new employee account.
 * Always assigns role 'employee', creates default leave balance atomically,
 * and rolls back user creation if balance setup fails.
 *
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const name = requireString(req.body.name, 'name', { min: 2, max: 50 });
  const rawEmail = requireString(req.body.email, 'email', { min: 3, max: 100 });
  const password = requireString(req.body.password, 'password', { min: 6, max: 72 });

  const email = rawEmail.toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Invalid email format', 400);
  }

  // Check if email is already taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Create user - strictly enforce role 'employee', ignoring any user-supplied role
  const user = await User.create({
    name,
    email,
    password,
    role: ROLES.EMPLOYEE,
  });

  // Create default leave balances; roll back user if balance creation fails
  try {
    await LeaveBalance.create({
      employee_id: user._id,
      sick: DEFAULT_BALANCES.sick,
      casual: DEFAULT_BALANCES.casual,
      annual: DEFAULT_BALANCES.annual,
    });
  } catch (balanceError) {
    await User.findByIdAndDelete(user._id);
    throw balanceError;
  }

  return res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

/**
 * Authenticate employee and issue JWT.
 * Mitigates timing attacks when account does not exist using dummy bcrypt comparison.
 *
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const rawEmail = requireString(req.body.email, 'email', { min: 1, max: 100 });
  const password = requireString(req.body.password, 'password', { min: 1, max: 72 });

  const email = rawEmail.toLowerCase();
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Timing mitigation: perform dummy hash comparison
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user);

  return res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    },
  });
});

module.exports = {
  register,
  login,
};
