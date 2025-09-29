require('dotenv').config();
const express = require('express');

const router = express.Router()

const { authenticateToken } = require("../middleware/middleware");

const { registerUser, loginUser, logoutUser, verifyUserToken } = require('../controller');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.post('/logout', logoutUser);


router.post('/verify-token', authenticateToken, verifyUserToken);

module.exports = router;