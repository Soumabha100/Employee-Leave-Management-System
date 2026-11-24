const express = require('express');
const router = express.Router();
const leaveReviewController = require('../controllers/leaveReviewController');

// ============================================================
// OWNER: Sohan
// ROUTER: Leave Reviews & Approvals (/api/leaves)
// ============================================================

router.get('/all', leaveReviewController.getAllLeaves);
router.put('/:id/approve', leaveReviewController.approveLeave);
router.put('/:id/reject', leaveReviewController.rejectLeave);

module.exports = router;
