const Message = require('../models/Message');
const Group = require('../models/Group');
const mongoose = require('mongoose');

// @desc    Get messages between two users or within a group
// @route   GET /api/messages/:user1/:targetId
// @access  Public
exports.getMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    
    let isGroup = false;
    if (mongoose.Types.ObjectId.isValid(user2)) {
      const group = await Group.findById(user2);
      if (group) {
        isGroup = true;
      }
    }
    
    let query = {};
    if (isGroup) {
      query = {
        receiver: user2,
        deletedBy: { $ne: user1 },
        $or: [{ scheduledAt: null }, { isSent: true }]
      };
    } else {
      query = {
        $or: [
          { sender: user1, receiver: user2 },
          { sender: user2, receiver: user1 }
        ],
        deletedBy: { $ne: user1 },
        $and: [{ $or: [{ scheduledAt: null }, { isSent: true }] }]
      };
    }
    
    const messages = await Message.find(query).sort({ timestamp: 1 }); // Oldest first
    
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search messages for a user
// @route   GET /api/messages/search?q=keyword&user=currentUser&with=targetId
// @access  Public
exports.searchMessages = async (req, res) => {
  try {
    const { q, user, with: targetId } = req.query;

    if (!q || !user) {
      return res.status(400).json({ success: false, message: 'Query and user are required' });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    let query = {
      content: regex,
      deletedBy: { $ne: user }
    };

    if (targetId) {
      const isGroup = mongoose.Types.ObjectId.isValid(targetId) && await Group.findById(targetId);
      if (isGroup) {
        query.receiver = targetId;
      } else {
        query.$or = [
          { sender: user, receiver: targetId },
          { sender: targetId, receiver: user }
        ];
      }
    } else {
      // Search all messages for this user
      query.$or = [
        { sender: user },
        { receiver: user }
      ];
    }

    const messages = await Message.find(query).sort({ timestamp: -1 }).limit(50);
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
