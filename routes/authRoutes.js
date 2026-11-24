const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ============================================================
// OWNER: Soumabha
// ROUTER: Authentication (/api/auth)
// ============================================================

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
