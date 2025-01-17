const express = require('express');  
const router = express.Router();  
const { messageHistory, sendImage} = require('../controllers/messageController');
const jwtVerifyMiddleware = require('../middleware/authMiddleware')

// Get message history for a specific user with pagination  
router.get('/message-history',jwtVerifyMiddleware, messageHistory);  
router.post('/messages/image',jwtVerifyMiddleware, sendImage);  

module.exports = router;