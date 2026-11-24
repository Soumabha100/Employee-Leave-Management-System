const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

// ============================================================
// OWNER: Soumabha
// ROUTER: Profile (/api/profile)
// ============================================================

router.get('/', profileController.getProfile);

module.exports = router;
