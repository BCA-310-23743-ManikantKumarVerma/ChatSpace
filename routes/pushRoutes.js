const express = require('express');
const { subscribe, getPublicKey } = require('../controllers/pushController');

const router = express.Router();

router.post('/subscribe', subscribe);
router.get('/public-key', getPublicKey);

module.exports = router;
