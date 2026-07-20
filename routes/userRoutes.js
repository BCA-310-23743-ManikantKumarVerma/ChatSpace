const express = require('express');
const { getUsers, getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

router.get('/', getUsers);
router.get('/:username', getUserProfile);
router.put('/:username', updateUserProfile);

module.exports = router;
