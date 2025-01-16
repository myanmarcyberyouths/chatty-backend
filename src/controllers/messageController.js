const Message = require('../models/message')
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

module.exports = { messageHistory }; // Export the function to be used in routes.js file.
