const express = require('express');  
const router = express.Router();  
const { messageHistory } = require('../controllers/messageController');
const jwtVerifyMiddleware = require('../middleware/authMiddleware')

// Get message history for a specific user with pagination  
router.get('/message-history',jwtVerifyMiddleware, messageHistory);  

module.exports = router;