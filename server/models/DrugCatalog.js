const mongoose = require('mongoose');

const drugCatalogSchema = new mongoose.Schema({
  brandName: { type: String, required: true, index: true },
  genericName: { type: String, required: true },
  strength: { type: String, required: true }, // e.g., "500mg"
  form: { type: String, required: true }, // e.g., "Tablet", "Capsule"
  packSize: { type: Number, required: true }, // e.g., 15 pills per strip
  pricePerPack: { type: Number, required: true }, // e.g., ₹120
  manufacturer: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DrugCatalog', drugCatalogSchema);