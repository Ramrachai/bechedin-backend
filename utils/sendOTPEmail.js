const sendEmail = require('./sendEmail');

async function sendOTPEmail(email, otp) {
  const to = email;
  const subject = 'OTP from Bike Arot';
  const message = `Your OTP from Bike Arot is: ${otp}`;
  const result = await sendEmail(to, subject, message);
  return result;
}

module.exports = sendOTPEmail;
