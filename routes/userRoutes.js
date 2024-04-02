const express = require('express');
const router = express.Router();
const authController = require('../controller/user/authController');
const alluser = require('../controller/user/alluser');

router.get('/', alluser);
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/otp-verify/:id?', authController.verifyOTP);

module.exports = router;
