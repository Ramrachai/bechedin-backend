const mongoose = require('mongoose');

const otpModelSchema = new mongoose.Schema(
  {
    otp: {
      type: Number,
      expires: '5m',
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const otpModel = mongoose.model('otpModel', otpModelSchema);

module.exports = otpModel;
