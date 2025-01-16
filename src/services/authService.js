require('dotenv').config();
const jose = require('jose');  

const sk = process.env.SECRET_KEY;  
const secret = new TextEncoder().encode(sk)

const AuthService = {  
    async generateToken(user) {  
        const payload = { sub: user._id };   

          const alg = 'HS256'
          
          const token = await new jose.SignJWT(payload)
            .setProtectedHeader({ alg })
            .setIssuedAt()
            .setIssuer('http://localhost:3000')
            .setAudience('urn:example:audience')
            .setExpirationTime('2h')
            .sign(secret)

        return token;  
    },  

    async verifyToken(token) {  

        try {  
            // Verify the JWT using the secret  
            const { payload, protectedHeader } = await jose.jwtVerify(token, secret, {  
                issuer: 'http://localhost:3000', // Expected issuer of the token  
                audience: 'urn:example:audience', // Expected audience of the token  
            });  

            return { payload, protectedHeader }; // Return the payload and header on success  
        } catch (error) {  
            // Handle verification errors  
            console.error('JWT verification error:', error);  
            throw new Error('Token verification failed'); // Re-throw error for handling upstream  
        }  
    }   
};  

module.exports = AuthService;
