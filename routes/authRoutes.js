const express = require('express');
const router = express.Router();
const authController = require('../controller/user/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logOutUser);
router.post('/verify-otp', authController.verifyOTP);
router.get('/resend-otp', authController.resedOTP);
router.get('/logInStatus', authController.logInStatus);
router.patch('/changepassword', authController.changePassword);
router.patch('/forgetpassword', authController.forgetPassword);
router.patch('/resetpassword', authController.resetPassword);

module.exports = router;
