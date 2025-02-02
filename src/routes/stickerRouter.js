const express = require('express')
const router = express.Router()
const { createSticker , getStickers , deleteSticker } = require('../controllers/stickerController');

router.post('/sticker' , createSticker);
router.get('/stickers' , getStickers);
router.delete('/sticker/:id', deleteSticker);

module.exports = router;
