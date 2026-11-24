const express = require('express');
const router = express.Router();
const leaveBalanceController = require('../controllers/leaveBalanceController');

// ============================================================
// OWNER: Sohan
// ROUTER: Leave Balance (/api/leave-balance)
// ============================================================

router.get('/', leaveBalanceController.getLeaveBalance);

module.exports = router;
