const express = require('express');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const leaveReviewRoutes = require('./routes/leaveReviewRoutes');
const leaveBalanceRoutes = require('./routes/leaveBalanceRoutes');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Body parser with 10kb limit
app.use(express.json({ limit: '10kb' }));

// Smoke-test health route
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

// Mounted routers
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/leaves', leaveReviewRoutes);
app.use('/api/leave-balance', leaveBalanceRoutes);

// 404 handler for unmatched routes
app.use(notFound);

// Central error handler (must be last)
app.use(errorHandler);

module.exports = app;
