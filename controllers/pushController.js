const webpush = require('web-push');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

webpush.setVapidDetails(
  'mailto:test@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// @desc    Subscribe to push notifications
// @route   POST /api/push/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { username, subscription } = req.body;
    if (!username || !subscription) {
      return res.status(400).json({ success: false, message: 'Username and subscription required' });
    }

    await User.findOneAndUpdate({ username }, { pushSubscription: subscription });
    res.status(200).json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to send push notification
exports.sendNotification = async (username, payload) => {
  try {
    const user = await User.findOne({ username });
    if (user && user.pushSubscription) {
      await webpush.sendNotification(user.pushSubscription, JSON.stringify(payload));
    }
  } catch (err) {
    console.error('Error sending push notification to', username, err.message);
    // If subscription is invalid (e.g., 410 Gone), we might want to remove it from DB
  }
};

// Also expose public key to client
exports.getPublicKey = (req, res) => {
  res.status(200).json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};
