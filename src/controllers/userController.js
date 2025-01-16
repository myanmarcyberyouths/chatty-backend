const User = require('../models/user');
const logger = require('pino')
const createUser = async (req , res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.create({ name, email, password });
        if (!user) return res.status(400).json({ error: 'Failed to create user' });
        res.status(201).json(user);
    } catch (error) {
        const duplication = error.message.split(' ').includes('E11000');
        res.status(400).json({ error: error.message, duplication: duplication });
    }
}

const getUser = async (req, res) => {
    const userId = req.params.id;
    console.log(req.user)
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        
        res.status(500).json({ error: error.message });
    }
}

const activeUsers = async (req, res) => {
    try {
        const users = await User.find({ isActive: true });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function findUserByPhone(phone) {
    try {
      const user = await User.findOne({ phone: phone, active: true }).select('name phone email active');
      if (!user) {
        return { success: false, message: 'User not found' };
      }
      return { success: true, user };
    } catch (error) {
      throw new Error('Error finding user: ' + error.message);
    }
  }

const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, email, password } = req.body;
    try {
        const user = await User.findByIdAndUpdate(userId, { name, email, password });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndDelete(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createUser, activeUsers, findUserByPhone, getUser, updateUser, deleteUser };