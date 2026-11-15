const express = require('express');
const router = express.Router();
const { 
  createDonation, 
  getAvailableDonations, 
  claimDonation 
} = require('../controllers/donationController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// POST /api/donations (Upload strip photo & list medicine)
router.post('/', protect, upload.single('image'), createDonation);

// GET /api/donations (Browse available vault items)
router.get('/', protect, getAvailableDonations);

// PATCH /api/donations/:id/claim (Claim/Reserve medicine)
router.patch('/:id/claim', protect, claimDonation);

module.exports = router;