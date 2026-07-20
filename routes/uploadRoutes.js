const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// POST /api/upload/profilePic
router.post('/profilePic', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const User = require('../models/User');
  try {
    const username = req.body.username;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });
    
    const fileUrl = '/uploads/' + req.file.filename;
    await User.findOneAndUpdate({ username }, { profilePic: fileUrl });
    res.json({ success: true, fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/upload/message
router.post('/message', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const fileUrl = '/uploads/' + req.file.filename;
  res.json({ success: true, fileUrl });
});

module.exports = router;
