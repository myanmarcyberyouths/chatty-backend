const mongoose = require('mongoose');  

const stickerSchema = new mongoose.Schema({  
    code: { type: String, required: true },  
    file_path: { type: String, required: true },  
    group_id: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },  
});  

const Sticker = mongoose.model('Sticker', stickerSchema);  

module.exports = Sticker;
