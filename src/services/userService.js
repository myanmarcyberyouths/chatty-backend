// UserService.js  
const User = require('../models/user');  

class UserService {  

    static async createUser(name, email, password) {  
        const user = new User({ name, email, password });  
        await user.save();  // Hashing will happen here due to the pre-save hook  
        return user;  
    }  

    static async findUserByEmail(name) {  
        return await User.findOne({ name });  
    }  

    // You can add more user-related methods if needed  
}  

module.exports = UserService;  
