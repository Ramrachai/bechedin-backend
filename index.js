const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const sendEmail = require('./utils/sendEmail');
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
app.use('/api/user', userRoutes);

app.get('/', async (req, res) => {
  res.json({ message: 'Connected to the server' });
});
app.post('/', (req, res) => {
  res.json({ message: 'got post reqest', data: req.body });
});
