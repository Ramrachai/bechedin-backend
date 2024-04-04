const UserModel = require('../../models/userModel');
const validateUser = require('../../utils/validateUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../../utils/sendEmail');
const OTPModel = require('../../models/otpModel');
const extractJWT = require('../../utils/extractJWT');
const generateOTP = require('../../utils/generateOTP');
const sendOTPEmail = require('../../utils/sendOTPEmail');

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
    const OTP = generateOTP(4);
    const emailResult = await sendOTPEmail(email, OTP);
    if (emailResult.success) {
      console.log('OTP send successfully =', OTP);
      newUser.resetToken = OTP; // save otp and email in DB
      newUser.resetTokenExpiry = Date.now() + 3600;
      await newUser.save();
    } else {
      console.log('Failed to send OTP via Email');
    }

    const maxAge = 60 * 60 * 1000; //  1 hour

    const token = jwt.sign(
      {
        userId: newUser._id,
        userEmail: newUser.email,
      },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', { token }, { secure: true, maxAge });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: true, message: error.message });
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
        role: user.role,
        loggedIn: true,
      },
      process.env.SECRET,
      { expiresIn: '24h' }
    );

    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milisecond

    res.cookie('token', { token }, { secure: true, maxAge });
    console.log('login successful');
    return res.status(200).json({
      token,
      loggedIn: true,
      user: { _id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ==================
// Resend OTP  Controller
// ==================
const resedOTP = async (req, res) => {
  const email = extractJWT(req, 'useEmail');
  const OTP = generateOTP(4);
  try {
    const otpStatus = await sendOTPEmail(email, OTP);
    if (!otpStatus.success) throw new Error('Failed to ReSend OTP Email');
    await OTPModel.create({ email, otp: OTP });
    return res
      .status(200)
      .json({ success: true, message: `An OTP has been sent to ${email}` });
  } catch (error) {
    console.error(`Resend OTP failed:`, error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==================
// OTP verification Controller
// ==================
const verifyOTP = async (req, res) => {
  try {
    let { otp } = req.body;
    const email = extractJWT(req, 'userEmail');
    const id = extractJWT(req, 'userId');

    console.log(
      'verify otp==',
      'email ==' + email,
      'id ==' + id,
      'otp ==' + otp
    );

    const DB_USER = await UserModel.findOne({ email });
    console.log('DB otp status is =', DB_USER);
    if (
      !DB_USER ||
      (DB_USER.resetToken !== Number(otp) &&
        DB_USER.resetTokenExpiry > Date.now())
    ) {
      await UserModel.findOneAndDelete({ email }); //delete unverified user
      console.log('deleted unverified user. ');
      return res.status(400).json({ verified: false, message: 'Invalid OTP' });
    }

    //after successful verification
    DB_USER.resetToken = undefined; // delete otp
    DB_USER.resetTokenExpiry = undefined;
    DB_USER.isVerified = true;
    let verifiedUser = await DB_USER.save();
    // Generate JWT token and login user
    const token = jwt.sign(
      {
        userId: verifiedUser._id,
        userName: verifiedUser.name,
        useEmail: verifiedUser.email,
        role: verifiedUser.role,
        loggedIn: true,
      },
      process.env.SECRET,
      { expiresIn: '24h' }
    );
    let maxAge = 60 * 60 * 1000; // 1 hour
    res.cookie('token', { token, loggedIn: true }, { secure: true, maxAge });
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
  const cookie = req.cookies.token;
  if (!cookie) {
    return res.json(false).end();
  }
  jwt.verify(cookie.token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.json(false);
    }
    return decoded.loggedIn === true
      ? res.json(true)
      : res.status(401).json(false);
  });
};

// ==================
// Change Password Controller
// ==================
const changePassword = async (req, res) => {
  const id = extractJWT(req, 'userId');
  const user = await UserModel.findById(id);
  const { oldPassword, newPassword } = req.body;

  if (!user) {
    console.log('user not found');
    return res
      .status(400)
      .json({ message: 'User not found, please signup or signin first' });
  }

  //validation
  if (!oldPassword || !newPassword) {
    console.log('fill old and new password fields');
    return res
      .status(400)
      .json({ message: 'Please provide old password and new password' });
  }

  //check if old password matches password in DB

  const isValidPassword = oldPassword === user.password;
  //=====!important: must enable following line to for production =====
  // const isValidPassword = await brypt.compare(oldPassword, user.password)

  //save new password
  if (user && isValidPassword) {
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ message: 'Password Changed Successfully', changePassword: true });
  } else {
    return res
      .status(400)
      .json({ message: 'Invalid Old Password', changePassword: false });
  }
};

// ==================
// Forget Password Controller
// ==================

const forgetPassword = async (req, res) => {
  console.log('forget password route ');
  const { email } = req.body;
  const OTP = generateOTP(4);
  const user = await UserModel.findOne({ email });
  !user && res.status(400).json({ message: 'User not found!' }).end();

  user.resetToken = OTP;
  user.resetTokenExpiry = Date.now() + 3600000; // 1h
  await user.save();

  const OTP_MESSAGE = `OTP for your Forget password is ${OTP}`;
  const emailResult = await sendEmail(
    email,
    'OTP for Forget Password',
    OTP_MESSAGE
  );
  console.log('email result == ', emailResult);
  if (emailResult.success) {
    return res.status(200).json({
      message: 'OTP for Forget password email sent successfully.',
      success: true,
    });
  } else {
    return res.status(400).json({
      message: 'Error sending OTP mail for Forget password',
      success: false,
    });
  }
};

// ==================
// Reset Password Controller
// ==================

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await UserModel.findOne({
      resetToken: Number(token),
      resetTokenExpiry: { $gt: Date.now() },
    });

    !user &&
      res.status(404).json({ message: 'Invalid or expired token' }).end();

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    return res
      .status(200)
      .json({ message: 'Password Reset Successful', success: true });
  } catch (error) {}
};

module.exports = {
  register,
  login,
  verifyOTP,
  resedOTP,
  logOutUser,
  logInStatus,
  changePassword,
  forgetPassword,
  resetPassword,
};
