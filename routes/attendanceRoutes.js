const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');

// ============================================================
// OWNER: Soumyajit
// ROUTER: Attendance (/api/attendance)
// ============================================================

// All attendance routes require authentication
router.use(protect);

router.post('/check-in', attendanceController.checkIn);
router.put('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getAttendance);

module.exports = router;
