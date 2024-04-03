const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const jwt = require('jsonwebtoken');
const extractJWT = require('./utils/extractJWT');
const generateOTP = require('./utils/generateOTP');
const app = express();

// Middlewares for security and parsing
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection (improved error handling)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Mongoose connected to:', process.env.MONGODB_URI);
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || 3001;
    app.listen(port, host, () => {
      console.log(`Server running on http://${host}:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);

//testing apis
app.get('/', async (req, res) => {
  let otp = generateOTP(4);
  return res.json({ message: 'Connected to the server', otp });
});

app.post('/', (req, res) => {
  const id = extractJWT(req, 'userId');
  return res.json({ message: 'got post reqest', id });
});
