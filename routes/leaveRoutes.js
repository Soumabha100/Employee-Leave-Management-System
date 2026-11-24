const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// ============================================================
// OWNER: Souvojit
// ROUTER: Leave Applications (/api/leaves)
// ============================================================

router.post('/', leaveController.applyLeave);
router.get('/', leaveController.getMyLeaves);

module.exports = router;
