const GroupMessage = require('../models/groupMessage');
const Group = require('../models/group');
const logger = require('../utils/logger');

// Load group chat history
const loadGroupMessages = async (socket, data) => {
  const { groupId } = data;

  try {
    const messages = await GroupMessage.find({ group: groupId })
      .sort({ timestamp: 1 })
      .populate('sender', 'name email');

    socket.emit('group chat history', messages);
  } catch (error) {
    logger.error('Error loading group messages:', error);
    socket.emit('error', { message: 'Failed to load group messages.' });
  }
};

// Save a new group message
const saveGroupMessage = async (io, data) => {
  const { sender, groupId, content, type } = data;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new Error('Group not found.');
    }

    const message = new GroupMessage({
      sender,
      group: groupId,
      content,
      type,
    });

    await message.save();

    // Populate sender details before emitting
    const populatedMessage = await GroupMessage.findById(message._id)
      .populate('sender', 'name email');

    // Emit the message to all members of the group
    io.to(groupId).emit('group message', populatedMessage);
  } catch (error) {
    logger.error('Error saving group message:', error);
    io.to(socket.id).emit('error', { message: 'Failed to send group message.' });
  }
};

module.exports = {
  loadGroupMessages,
  saveGroupMessage,
};
