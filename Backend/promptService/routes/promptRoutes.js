require('dotenv').config();
const express = require('express');

const {getUserId} = require('../middleware/middleware.js');
const { getPrompts, addPrompt, deletePrompt, updatePrompt, favouritePrompt } = require('../controller/index.js');

const router = express.Router()

router.get('/getPrompts',getUserId,getPrompts)

router.post('/addPrompt',getUserId,addPrompt)

router.delete('/deletePrompt',getUserId,deletePrompt)

router.patch('/updatePrompt',getUserId,updatePrompt)

router.patch('/favoritePrompt',getUserId,favouritePrompt)

module.exports = router;