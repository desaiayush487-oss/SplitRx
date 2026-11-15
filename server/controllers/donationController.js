    const DonationItem = require('../models/DonationItem');
const User = require('../models/User');

// @desc    List an unused medicine strip for donation
// @route   POST /api/donations
// @access  Private
const createDonation = async (req, res) => {
  try {
    const { drugName, quantityPills, expiryDate, batchNumber } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a photo of the medicine strip' });
    }

    const stripImageUrl = req.file.path; // Cloudinary secure URL from multer

    const donation = await DonationItem.create({
      donor: req.user._id,
      drugName,
      quantityPills,
      expiryDate,
      batchNumber,
      stripImageUrl,
      status: 'Available'
    });

    // Add donation reference to user's profile
    await User.findByIdAndUpdate(req.user._id, {
      $push: { donations: donation._id }
    });

    res.status(201).json({
      message: 'Medicine successfully listed in the Donation Vault!',
      donation
    });
  } catch (error) {
    console.error('Donation Creation Error:', error);
    res.status(500).json({ message: 'Server error while listing donation', error: error.message });
  }
};

// @desc    Get all available medicine donations in the vault
// @route   GET /api/donations
// @access  Private
const getAvailableDonations = async (req, res) => {
  try {
    const donations = await DonationItem.find({ status: 'Available' })
      .populate('donor', 'name email role')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (error) {
    console.error('Fetch Donations Error:', error);
    res.status(500).json({ message: 'Server error while fetching donations', error: error.message });
  }
};

// @desc    Claim an available donation item
// @route   PATCH /api/donations/:id/claim
// @access  Private
const claimDonation = async (req, res) => {
  try {
    const donation = await DonationItem.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation item not found' });
    }

    if (donation.status !== 'Available') {
      return res.status(400).json({ message: 'This medicine has already been reserved or distributed.' });
    }

    // Prevent user from claiming their own donation
    if (donation.donor.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot claim your own donation.' });
    }

    donation.status = 'Reserved';
    await donation.save();

    res.json({
      message: 'Donation successfully reserved!',
      donation
    });
  } catch (error) {
    console.error('Claim Donation Error:', error);
    res.status(500).json({ message: 'Server error while claiming donation', error: error.message });
  }
};

module.exports = { createDonation, getAvailableDonations, claimDonation };