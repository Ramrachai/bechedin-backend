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
const OtpModel = require('./models/otpModel');
const app = express();

// Middlewares for security and parsing
// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Replace with your frontend URL
  credentials: true, // Allow cookies to be sent with the request
};

app.use(cors(corsOptions));
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
  res.cookie('token', otp);
  return res.json({ otp, message: 'Connected to the server' });
});

app.post('/', (req, res) => {
  console.log(req.cookies);
  let token = req.cookies.token;
  return res.json({ message: 'got post reqest', token });
});
