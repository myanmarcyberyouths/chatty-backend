const express = require('express');
const router = express.Router();
const { sendImage , sendSticker,  getGroups , createGroup , addMembers, removeMember, getGroupDetails, deleteGroup } = require('../controllers/groupController');

router.get('/:userId' , getGroups);

router.post('/image', sendImage);

router.post('/sticker', sendSticker);

router.post('/create', createGroup);

router.post('/:groupId/add-members', addMembers);

router.delete('/:groupId/remove-member/:userId', removeMember);

router.get('/details/:groupId', getGroupDetails);

router.delete('/:groupId/delete', deleteGroup);

module.exports = router;
