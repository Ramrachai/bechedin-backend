const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: 'mail.ramrachai.com',
    port: 465,
    secure: true,
    auth: {
      user: 'contact@ramrachai.com',
      pass: '4k2Brw#KZE5I',
    },
  });

  const mailOptions = {
    from: 'contact@ramrachai.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent', info.response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    return { success: false, message: 'Failed to send email' };
  }
};

module.exports = sendEmail;
