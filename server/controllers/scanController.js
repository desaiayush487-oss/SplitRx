const Prescription = require('../models/Prescription');
const tesseract = require('tesseract.js');

// @desc    Upload prescription, run OCR, and save to DB
// @route   POST /api/scan/upload
// @access  Private
const scanPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    // req.file.path contains the secure Cloudinary URL returned by multer-storage-cloudinary
    const imageUrl = req.file.path;

    // Run Tesseract OCR on the uploaded image URL
    const { data: { text } } = await tesseract.recognize(imageUrl, 'eng', {
      logger: (m) => console.log(m), // Optional: logs progress in terminal
    });

    // Basic text parsing helper (extracting potential medicine names & dosages)
    // In production, you can enhance this regex or use an LLM API to parse structured data
    const parsedMedicines = [];
    const lines = text.split('\n');
    lines.forEach((line) => {
      if (line.trim().length > 3) {
        // Simple heuristic line capture for demo
        parsedMedicines.push({
          drugName: line.trim(),
          dosage: 'As prescribed',
          frequency: '1-0-1',
          duration: '30 days'
        });
      }
    });

    // Save prescription record to database
    const prescription = await Prescription.create({
      user: req.user._id,
      imageUrl,
      extractedText: text,
      parsedMedicines: parsedMedicines.slice(0, 5), // Keep top matches for demo
    });

    res.status(201).json({
      message: 'Prescription scanned successfully!',
      prescription,
    });
  } catch (error) {
    console.error('OCR Error:', error);
    res.status(500).json({ message: 'Server error during OCR scan', error: error.message });
  }
};

// @desc    Get all prescriptions for logged-in user
// @route   GET /api/scan/my-prescriptions
// @access  Private
const getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { scanPrescription, getUserPrescriptions };