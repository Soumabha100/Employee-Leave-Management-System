const express = require('express');
const router = express.Router();
const leaveReviewController = require('../controllers/leaveReviewController');

// ============================================================
// OWNER: Sohan
// ROUTER: Leave Reviews & Approvals (/api/leaves)
// ============================================================

// NOTE: GET /all has been moved to leaveRoutes.js (Souvojit's controller)
// to ensure /all is defined before /:id and to consolidate leave query logic.
router.put('/:id/approve', leaveReviewController.approveLeave);
router.put('/:id/reject', leaveReviewController.rejectLeave);

module.exports = router;
