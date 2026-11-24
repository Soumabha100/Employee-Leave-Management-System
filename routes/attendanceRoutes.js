const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// ============================================================
// OWNER: Soumyajit
// ROUTER: Attendance (/api/attendance)
// ============================================================

router.post('/check-in', attendanceController.checkIn);
router.put('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.getAttendance);

module.exports = router;
