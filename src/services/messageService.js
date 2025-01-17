const Message = require('../models/message')

const saveMessage = async (messageData) => {  
    try {  
        const message = new Message(messageData);  
        await message.save();  
        console.log('Message saved:', message);
    } catch (error) {  
        console.error('Error saving message:', error);  
    }  
};  


module.exports = {  
    saveMessage,  
};
