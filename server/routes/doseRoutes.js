const express = require('express');
const router = express.Router();
const { optimizeDose } = require('../controllers/doseController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/dose/optimize (Protected route)
router.post('/optimize', protect, optimizeDose);

module.exports = router;