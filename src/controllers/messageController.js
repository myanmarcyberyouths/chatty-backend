const Message = require('../models/message')
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single('image');

const sendImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, message: 'Error uploading file.' });
    }

    const { sender, recipient } = req.body;
    const imageUrl = req.file.path;

    try {
      const message = new Message({
        sender,
        recipient,
        content: imageUrl,
        type: 'image', 
      });

      await message.save();

      // const io = req.app.get('socketio');
      // io.to(recipient).emit('new message', message);

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error('Error saving image message:', error);
      res.status(500).json({ success: false, message: 'Error sending image.' });
    }
  });
};

const messageHistory = async (req, res) => {
  const { sender, recipient, page = 1, limit = 10 } = req.query; // Default to page 1 and limit of 10

  const messagesPerPage = parseInt(limit);
  const currentPage = parseInt(page);

  try {
    const messages = await Message.find({
      $or: [
        { sender: sender, recipient: recipient },
        { sender: recipient, recipient: sender },
      ],
    })
      .sort({ timestamp: -1 }) // Sort by timestamp descending
      .skip((currentPage - 1) * messagesPerPage) // Paginate
      .limit(messagesPerPage); // Limit results

    // Get total messages count for pagination
    const totalMessages = await Message.countDocuments({
      $or: [
        { sender: sender, recipient: recipient },
        { sender: recipient, recipient: sender },
      ],
    });

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show the oldest first in the response
      totalMessages,
      currentPage,
      totalPages: Math.ceil(totalMessages / messagesPerPage),
    });
  } catch (error) {
    console.error("Error retrieving message history:", error);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving message history." });
  }
};

module.exports = { messageHistory , sendImage}; // Export the function to be used in routes.js file.
