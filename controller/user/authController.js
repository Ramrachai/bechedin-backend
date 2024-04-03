const UserModel = require('../../models/userModel');
const validateUser = require('../../utils/validateUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');
const OTPModel = require('../../models/otpModel');


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
    let user = await UserModel.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      console.log('user already exist');
      return res
        .status(400)
        .json({ status: 'failed', message: 'User already exists' });
    }
    // create a new user
    let newUser = await UserModel.create({ name, phone, email, password });
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
      await OTPModel.create({ email, otp }); // save otp and email in DB
    } else {
      console.log('Failed to send OTP via Email');
    }

    const maxAge = 60 * 60 * 1000; //  1 hour

    res.cookie(
      'userInfo',
      { email: newUser.email, id: newUser._id },
      { maxAge: maxAge }
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

// ==================
// USER LOGIN  Controller
// ==================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.log('user not found');
      return res.status(404).json({ message: 'User not found' });
    }

    // Important: disabled only for development , must enable it before product.
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      console.log('Invalid Password!');
      return res.status(401).json({ message: 'Invalid Password!' });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.name,
        useEmail: user.email,
        loggedIn: true,
      },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const maxAge = 5 * 60 * 1000; // 24 hours in milisecond

    res.cookie(
      'token',
      { token, loggedIn: true },
      { httpOnly: true, secure: true, maxAge }
    );
    return res.status(200).json({
      token,
      user: { _id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==================
// OTP verification Controller
// ==================
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log(
      'your cookies  are : ',
      req.cookies,
      `email == ${req.cookies.userInfo.email} || id == ${req.cookies.userInfo.id}`
    );
    const { email, id } = req.cookies.userInfo;
    const DB_OTP = await OTPModel.findOne({ email });
    console.log('DB otp status is ', DB_OTP);
    if (!DB_OTP || DB_OTP.otp !== Number(otp)) {
      await UserModel.findOneAndDelete({ email }); //delet unverified user
      return res.status(400).json({ verified: false, message: 'Invalid OTP' });
    }

    //after successful verification
    await OTPModel.findOneAndDelete({ email }); // delete otp
    console.log('otp deleted from OTPModel');
    await UserModel.findByIdAndUpdate(id, { $set: { isVerified: true } }); // update user status
    console.log('user status updated: isVarified=true');

    // Generate JWT token and login user
    const token = jwt.sign(
      { userId: DB_OTP._id, userEmail: DB_OTP.email, loggedIn: true },
      process.env.SECRET,
      { expiresIn: '24h' }
    );
    let maxAge = 60 * 60 * 1000; // 1 hour
    res.cookie(
      'token',
      { token, loggedIn: true },
      { httpOnly: true, secure: true, maxAge }
    );
    console.log('token sent in cookie');
    return res
      .status(200)
      .json({ message: 'OTP verified successfully', verified: true });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ==================
// Log out Controller
// ==================

const logOutUser = async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('userInfo');
  return res
    .status(200)
    .json({ message: 'Loged out Successful', logOut: true });
};

// ==================
// Log in Status Controller
// ==================
const logInStatus = async (req, res) => {
  const {token} = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.json(false);
    }
    return decoded.loggedIn === true
      ? res.json(true)
      : res.status(401).json(false);
  });
};

module.exports = {
  register,
  login,
  verifyOTP,
  logOutUser,
  logInStatus,
};
