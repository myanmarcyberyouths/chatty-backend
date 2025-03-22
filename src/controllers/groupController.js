const Group = require('../models/group');
const User = require('../models/user');
const Message = require('../models/message');
const GroupMessage = require('../models/groupMessage');
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

    const { sender, groupId } = req.body; // `groupId` is required
    const imageUrl = req.file.path;

    try {
      // Check if the group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found.' });
      }

      // Create the message
      const message = new GroupMessage({
        sender,
        group: groupId,
        content: imageUrl,
        type: 'image',
      });

      await message.save();

      const populatedMessage = await GroupMessage.findById(message._id).populate('sender');

      res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
      console.error('Error saving group image message:', error);
      res.status(500).json({ success: false, message: 'Error sending image to group.' });
    }
  });
};

const sendSticker = async (req, res) => {
  const { sender, groupId, content } = req.body; // `groupId` is required

  try {
    // Check if the group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Create a new group message
    const message = new GroupMessage({
      sender,
      group: groupId,
      content,
      type: 'sticker',
    });

    await message.save();

    const populatedMessage = await GroupMessage.findById(message._id).populate('sender');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('Error saving group sticker message:', error);
    res.status(500).json({ success: false, message: 'Error sending sticker to group.' });
  }
};
const getGroups = async (req, res) => {
  const { userId } = req.params;

  try {
    const groups = await Group.find({ members: userId })
      .populate("members", "name email")
      .populate("admin", "name email");

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ success: false, message: "Error fetching groups." });
  }
};

const createGroup = async (req, res) => {
  const { name, admin, members } = req.body;

  try {
    // Validate that the admin exists
    const adminUser = await User.findById(admin);
    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin user not found.' });
    }

    // Validate that all members exist
    const memberUsers = await User.find({ _id: { $in: members } });
    if (memberUsers.length !== members.length) {
      return res.status(404).json({ success: false, message: 'One or more members not found.' });
    }

    // Create the group
    const group = new Group({
      name,
      admin,
      members: [...members, admin], // Include the admin in the members list
    });

    await group.save();

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ success: false, message: 'Error creating group.' });
  }
};

// Add members to an existing group
const addMembers = async (req, res) => {
  const { groupId } = req.params;
  const { members } = req.body;

  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Validate that all new members exist
    const newMembers = await User.find({ _id: { $in: members } });
    if (newMembers.length !== members.length) {
      return res.status(404).json({ success: false, message: 'One or more members not found.' });
    }

    // Add new members to the group (avoid duplicates)
    const updatedMembers = [...new Set([...group.members, ...members])];
    group.members = updatedMembers;

    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error('Error adding members to group:', error);
    res.status(500).json({ success: false, message: 'Error adding members to group.' });
  }
};

// Remove a member from a group
const removeMember = async (req, res) => {
  const { groupId, userId } = req.params;

  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return res.status(404).json({ success: false, message: 'User is not a member of the group.' });
    }

    // Remove the user from the group
    group.members = group.members.filter((member) => member.toString() !== userId);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    console.error('Error removing member from group:', error);
    res.status(500).json({ success: false, message: 'Error removing member from group.' });
  }
};

// Get group details (including members and messages)
const getGroupDetails = async (req, res) => {
  const { groupId } = req.params;

  try {
    // Find the group and populate members and messages
    const group = await Group.findById(groupId)
      .populate('members', 'name email') // Populate member details
      .populate('admin', 'name email'); // Populate admin details

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Fetch messages for the group
    const messages = await Message.find({ group: groupId })
      .populate('sender', 'name email') // Populate sender details
      .sort({ timestamp: -1 }); // Sort by timestamp (newest first)

    res.status(200).json({
      success: true,
      data: {
        group,
        messages,
      },
    });
  } catch (error) {
    console.error('Error fetching group details:', error);
    res.status(500).json({ success: false, message: 'Error fetching group details.' });
  }
};

// Delete a group (only allowed by the admin)
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { adminId } = req.body; // Admin ID to verify permissions

  try {
    // Find the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found.' });
    }

    // Verify that the requester is the admin
    if (group.admin.toString() !== adminId) {
      return res.status(403).json({ success: false, message: 'Only the admin can delete the group.' });
    }

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    // Delete all messages associated with the group
    await Message.deleteMany({ group: groupId });

    res.status(200).json({ success: true, message: 'Group deleted successfully.' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ success: false, message: 'Error deleting group.' });
  }
};

module.exports = { sendImage , sendSticker , getGroups , createGroup, addMembers, removeMember, getGroupDetails, deleteGroup };
