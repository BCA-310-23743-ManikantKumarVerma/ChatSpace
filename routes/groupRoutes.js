const express = require('express');
const { createGroup, getGroups, addMember, removeMember, transferAdmin, leaveGroup, pinMessage } = require('../controllers/groupController');

const router = express.Router();

router.post('/', createGroup);
router.get('/:username', getGroups);
router.put('/:id/members', addMember);
router.delete('/:id/members/:username', removeMember);
router.put('/:id/admin', transferAdmin);
router.delete('/:id/leave', leaveGroup);
router.patch('/:id/pin', pinMessage);

module.exports = router;

