require('dotenv').config();
const express = require('express');

const {getUserId} = require('../middleware/middleware.js');
const { 
    getPrompts, 
    addPrompt, 
    deletePrompt, 
    updatePrompt, 
    favouritePrompt,
    trackPromptView,
    trackPromptCopy,
    getPromptById
} = require('../controller/index.js');

const router = express.Router()

router.get('/getPrompts',getUserId,getPrompts)

router.get('/getPrompt/:id',getUserId,getPromptById)

router.post('/addPrompt',getUserId,addPrompt)

router.delete('/deletePrompt',getUserId,deletePrompt)

router.patch('/updatePrompt',getUserId,updatePrompt)

router.patch('/favoritePrompt',getUserId,favouritePrompt)

// Analytics tracking endpoints
router.post('/trackView/:id',getUserId,trackPromptView)

router.post('/trackCopy/:id',getUserId,trackPromptCopy)

module.exports = router;