const multer = require('multer');
const path = require('path');
const Sticker = require('../models/sticker');

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
         group_id: group_id,
      });

      await sticker.save();

      res.status(201).json({ success: true, data: sticker });
    } catch (error) {
      console.error('Error saving image message:', error);
      res.status(500).json({ success: false, message: 'Error saving image.' });
    }
  });
};

module.exports = { createSticker };
