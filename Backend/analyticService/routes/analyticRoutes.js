require('dotenv').config();
const express = require('express');

const {getUserId} = require('../middleware/middleware.js');
const {getReport} = require('../controller/index.js')

const router = express.Router()

// Get overall analytics report
router.get('/getReport', getUserId, getReport)


module.exports = router;