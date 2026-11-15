const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true }, // Cloudinary secure URL
  extractedText: { type: String }, // Raw OCR text from Tesseract.js
  parsedMedicines: [
    {
      drugName: String,
      dosage: String,
      frequency: String, // e.g., "1-0-1"
      duration: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);