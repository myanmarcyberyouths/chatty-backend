const mongoose = require('mongoose');  

const messageSchema = new mongoose.Schema({  
    sender: { type: String, required: true },  
    recipient: { type: String, required: true },  
    content: { type: String, required: true },  
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    type: { type: String, enum: ['text', 'sticker' , 'image'], default: 'text' },
    timestamp: { type: Date, default: Date.now },  
});  

const Message = mongoose.model('Message', messageSchema);  

module.exports = Message;
