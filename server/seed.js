require('dotenv').config();
const mongoose = require('mongoose');
const DrugCatalog = require('./models/DrugCatalog'); // Adjust path to your model if needed

const sampleDrugs = [
  {
    brandName: "Glycomet 500",
    genericName: "Metformin",
    strength: "500mg",
    form: "Tablet",
    packSize: 20,
    pricePerPack: 45,
    manufacturer: "USV Private Limited"
  },
  {
    brandName: "Glycomet SR 1000",
    genericName: "Metformin",
    strength: "1000mg",
    form: "Tablet",
    packSize: 15,
    pricePerPack: 78,
    manufacturer: "USV Private Limited"
  },
  {
    brandName: "Crocin Advance",
    genericName: "Paracetamol",
    strength: "650mg",
    form: "Tablet",
    packSize: 15,
    pricePerPack: 32,
    manufacturer: "GlaxoSmithKline"
  },
  {
    brandName: "Calpol 500",
    genericName: "Paracetamol",
    strength: "500mg",
    form: "Tablet",
    packSize: 15,
    pricePerPack: 28,
    manufacturer: "GSK Pharmaceuticals"
  },
  {
    brandName: "Pan 40",
    genericName: "Pantoprazole",
    strength: "40mg",
    form: "Tablet",
    packSize: 15,
    pricePerPack: 115,
    manufacturer: "Alkem Laboratories"
  },
  {
    brandName: "Storvas 10",
    genericName: "Atorvastatin",
    strength: "10mg",
    form: "Tablet",
    packSize: 15,
    pricePerPack: 140,
    manufacturer: "Sun Pharma"
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB Atlas using your existing .env MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 Connected to MongoDB Atlas for Seeding...');

    // Clear existing catalog (optional, ensures clean test state)
    await DrugCatalog.deleteMany({});
    console.log('🗑️ Cleared old drug catalog entries.');

    // Insert new sample drugs
    await DrugCatalog.insertMany(sampleDrugs);
    console.log('✅ Successfully seeded everyday drugs into DrugCatalog!');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();