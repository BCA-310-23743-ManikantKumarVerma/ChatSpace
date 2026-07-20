const express = require('express');
const { getMessages, searchMessages } = require('../controllers/messageController');

const router = express.Router();

router.get('/search', searchMessages);
router.get('/:user1/:user2', getMessages);

module.exports = router;
