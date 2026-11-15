const express = require('express');
const router = express.Router();
const { scanPrescription, getUserPrescriptions } = require('../controllers/scanController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// POST /api/scan/upload (Protected route with Cloudinary single image upload)
router.post('/upload', protect, upload.single('image'), scanPrescription);

// GET /api/scan/my-prescriptions (Protected route)
router.get('/my-prescriptions', protect, getUserPrescriptions);

// Don't forget to uncomment this in server.js!
module.exports = router;