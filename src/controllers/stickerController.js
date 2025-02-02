const multer = require('multer');
const path = require('path');
const Sticker = require('../models/sticker');
const fs = require('fs');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/stickers/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single('image');

const createSticker = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(500).json({ success: false, message: `${err}` });
    }

    const { code , group_id } = req.body;
    const imageUrl = req.file.path;

    try {
      const sticker = new Sticker({
         code: code,
         file_path: imageUrl,
      });

      await sticker.save();

      res.status(201).json({ success: true, data: sticker });
    } catch (error) {
      console.error('Error saving image message:', error);
      res.status(500).json({ success: false, message: 'Error saving image.' });
    }
  });
};

const deleteSticker = async (req, res) => {
  const { id } = req.params; // Get the sticker ID from the URL

  try {
    // Find the sticker by ID
    const sticker = await Sticker.findById(id);

    if (!sticker) {
      return res.status(404).json({ success: false, message: 'Sticker not found' });
    }

    // Delete the sticker from the database
    await Sticker.findByIdAndDelete(id);

    // Optionally, delete the associated file from the server
    const filePath = path.join(__dirname, '..', sticker.file_path); // Adjust the path as needed

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:', filePath);
      }
    });

    res.status(200).json({ success: true, message: 'Sticker deleted successfully' });
  } catch (error) {
    console.error('Error deleting sticker:', error);
    res.status(500).json({ success: false, message: 'Error deleting sticker' });
  }
};

const getStickers = async (req , res) => {
  try {
    const stickers = await Sticker.find();
    res.status(200).json({ success: true, data: stickers })
  } catch ( error ) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Error fetching stickers.' });
  }
} 

module.exports = { createSticker , getStickers , deleteSticker };
