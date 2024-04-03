const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
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
  console.log('get request received');
  return res.json({ message: 'Connected to the server' });
});
app.post('/', (req, res) => {
  console.log('got post request==', req.body);
  let { email, name } = req.body;
  res.cookie(
    'token',
    { token: '1242342', loggedIn: true, email, name },
    { maxAge: 2 * 68 * 1000 }
  );

  return res.json({ message: 'got post reqest', data: req.body });
});
