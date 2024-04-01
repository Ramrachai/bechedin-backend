const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(helmet());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Mongoose connected to =' + process.env.MONGODB_URI);
    app.listen(3001, function () {
      console.log('Server is running on port 3001');
    });
  })
  .catch((e) => {
    console.error('Error connecting to MongoDB: ', e);
  });
