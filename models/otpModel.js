const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Define TTL index on 'createdAt' field to expire documents after 30 seconds
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 });

const OTPModel = mongoose.model('otpModel', otpSchema);

module.exports = OTPModel;
