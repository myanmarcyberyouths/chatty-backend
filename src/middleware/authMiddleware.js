const AuthService = require('../services/authService'); // Make sure the path is correct  
const logger = require('../utils/logger');

const verifyJwtMiddleware = async (req, res, next) => {  
    const token = req.headers['authorization']?.split(' ')[1]; // Assuming Bearer token format  
    logger.info({token});
    
    if (!token) {  
        return res.status(401).json({ error: 'Token is required' });  
    }  

    try {  
        const { payload, protectedHeader } = await AuthService.verifyToken(token);  
        req.user = payload; // Attach user information to request object  
        next(); // Proceed to the next middleware or route handler  
    } catch (error) {  
        return res.status(401).json({ error: error.message }); // Handle errors gracefully  
    }  
};  
module.exports = verifyJwtMiddleware; 
