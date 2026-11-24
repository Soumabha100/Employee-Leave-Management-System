const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateObjectId } = require('../utils/validators');

// ============================================================
// OWNER: Souvojit
// ROUTER: Leave Applications (/api/leaves)
// ============================================================

// All routes require authentication
router.use(protect);

// POST /api/leaves - Apply for leave
router.post('/', leaveController.applyLeave);

// GET /api/leaves - Employee's own leave history
router.get('/', leaveController.getMyLeaves);

// GET /api/leaves/all - HR/Admin: all leave requests with search, filters, sort, pagination
// IMPORTANT: /all must be defined BEFORE /:id so Express does not treat "all" as an ID
router.get('/all', authorize('admin', 'hr'), leaveController.getAllLeaves);

// GET /api/leaves/:id - Single leave by ID (ownership check inside controller)
router.get('/:id', validateObjectId('id'), leaveController.getLeaveById);

// DELETE /api/leaves/:id - Cancel own pending leave
router.delete('/:id', validateObjectId('id'), leaveController.cancelLeave);

module.exports = router;
