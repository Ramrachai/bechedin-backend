const express = require('express');
const router = express.Router();
const register = require('../controller/user/register');
const alluser = require('../controller/user/alluser');

router.get('/', alluser);
router.post('/register', register);

module.exports = router;
