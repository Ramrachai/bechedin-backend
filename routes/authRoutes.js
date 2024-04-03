const express = require('express');
const router = express.Router();
const authController = require('../controller/user/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logOutUser);
router.post('/otp-verify', authController.verifyOTP);

module.exports = router;
