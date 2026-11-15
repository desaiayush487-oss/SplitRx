const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Assuming you have a db.js config file

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/scan', require('./routes/scanRoutes'));
app.use('/api/dose', require('./routes/doseRoutes'));
app.use('/api/donations', require('./routes/donationRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.send('SplitRx API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in development mode on port ${PORT}`);
});