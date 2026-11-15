const mongoose = require('mongoose');

const donationItemSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drugName: { type: String, required: true },
  quantityPills: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  batchNumber: { type: String },
  stripImageUrl: { type: String, required: true }, // Cloudinary image URL of the strip
  status: { 
    type: String, 
    enum: ['Available', 'Reserved', 'Distributed'], 
    default: 'Available' 
  }
}, { timestamps: true });

module.exports = mongoose.model('DonationItem', donationItemSchema);