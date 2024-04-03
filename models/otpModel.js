const mongoose = require('mongoose');

const otpModelSchema = new mongoose.Schema(
  {
    otp: {
      type: Number,
    },
    email: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const OtpModel = mongoose.model('otpModel', otpModelSchema);

module.exports = OtpModel;
