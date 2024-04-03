// Generate OTP of specified length
function generateOTP(length = 4) {
  const digits = '0123456789';
  let OTP = '';

  for (let i = 0; i < length; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }

  return OTP;
}

module.exports = generateOTP;
