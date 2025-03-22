const Message = require('../models/message');
const multer = require('multer');
const path = require('path');

// Multer configuration for file uploads
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

// Send an image message (supports both individual and group messages)
const sendImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, message: 'Error uploading file.' });
    }

    const { sender, recipient, group } = req.body; // `group` is optional
    const imageUrl = req.file.path;

    try {
      const message = new Message({
        sender,
        recipient: group ? null : recipient, // If group is provided, recipient is null
        group: group || null, // If group is provided, set the group field
        content: imageUrl,
        type: 'image',
      });

      await message.save();

      res.status(201).json({ success: true, data: message });
    } catch (error) {
      console.error('Error saving image message:', error);
      res.status(500).json({ success: false, message: 'Error sending image.' });
    }
  });
};

// Send a sticker message (supports both individual and group messages)
const sendSticker = async (req, res) => {
  const { sender, recipient, content, group } = req.body; // `group` is optional

  try {
    const message = new Message({
      sender,
      recipient: group ? null : recipient, // If group is provided, recipient is null
      group: group || null, // If group is provided, set the group field
      content,
      type: 'sticker',
    });

    await message.save();

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error saving sticker message:', error);
    res.status(500).json({ success: false, message: 'Error sending sticker.' });
  }
};

const messageHistory = async (req, res) => {
  const { sender, recipient, group, page = 1, limit = 10 } = req.query; 

  const messagesPerPage = parseInt(limit);
  const currentPage = parseInt(page);

  try {
    let query;

    if (group) {
      query = { group };
    } else {
      query = {
        $or: [
          { sender: sender, recipient: recipient },
          { sender: recipient, recipient: sender },
        ],
      };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 }) // Sort by timestamp descending
      .skip((currentPage - 1) * messagesPerPage) // Paginate
      .limit(messagesPerPage); // Limit results

    // Get total messages count for pagination
    const totalMessages = await Message.countDocuments(query);

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show the oldest first in the response
      totalMessages,
      currentPage,
      totalPages: Math.ceil(totalMessages / messagesPerPage),
    });
  } catch (error) {
    console.error('Error retrieving message history:', error);
    res.status(500).json({ success: false, message: 'Error retrieving message history.' });
  }
};

module.exports = { messageHistory, sendImage, sendSticker };
