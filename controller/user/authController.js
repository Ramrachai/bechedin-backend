const User = require('../../models/userModel');
const validateUser = require('../../utils/validateUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');
const otpModel = require('../../models/otpModel');

// ==== user registration controller
const register = async (req, res) => {
  try {
    // validate request body
    const { name, phone, email, password } = req.body;
    const validationError = validateUser(req.body);
    if (validationError) {
      return res
        .status(400)
        .json({ status: 'error', message: validationError });
    }
    //check if user already exists
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      console.log('user already exist');
      return res
        .status(400)
        .json({ status: 'failed', message: 'User already exists' });
    }
    // create a new user
    let newUser = await User.create({ name, phone, email, password });
    if (!newUser) {
      throw new Error('Unable to save user in Database');
    }

    //send otp to email
    const otp = Math.floor(Math.random() * 9000 + 1000);
    const emailSubject = 'OTP from Bike Arot';
    const emailText = `Your OTP for Bike arot account registration is ${otp}`;
    const emailResult = await sendEmail(email, emailSubject, emailText);
    if (emailResult.success) {
      console.log('OTP send successfully');
    } else {
      console.log('Failed to send OTP via Email');
    }

    res.cookie(
      'userInfo',
      { email: newUser.email, id: newUser._id },
      { maxAge: 60 * 60 * 1000 }
    );

    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//==== user login controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      console.log('user not found');
      return res.status(404).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid Password!');
      return res.status(401).json({ message: 'Invalid Password!' });
    }
    const token = jwt.sign(
      { userId: user._id, userName: user.name, useEmail: user.email },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milisecond

    res.cookie('token', token, { httpOnly: true, secure: true, maxAge });
    return res.status(200).json({
      token,
      user: { _id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// POST endpoint to verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email, _id } = req.cookie;
    const user = await otpModel.findOne({ email });
    if (!user || user.otp !== otp) {
      await User.findOneAndDelete({ email });
      return res.status(400).json({ verified: false, message: 'Invalid OTP' });
    }

    //after successful verification
    await otpModel.findOneAndDelete({ email });
    await User.findByIdAndUpdate(_id, { $set: { isVerified: true } }); //

    // Generate JWT token and login user
    const token = jwt.sign(
      { userId: user._id, userName: user.name, userEmail: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    let maxAge = 60 * 60 * 1000; // 1 hour
    res.cookie('token', token, { httpOnly: true, secure: true, maxAge });
    return res
      .status(200)
      .json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  verifyOTP,
};
