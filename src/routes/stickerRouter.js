const express = require('express')
const router = express.Router()
const { createSticker } = require('../controllers/stickerController');

router.post('/sticker' , createSticker);

module.exports = router;
