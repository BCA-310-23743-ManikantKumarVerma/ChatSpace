const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  receiver: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['text', 'image', 'audio', 'file'],
    default: 'text'
  },
  fileUrl: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    type: String
  }],
  // Emoji reactions: array of { user, emoji }
  reactions: [{
    user: { type: String, required: true },
    emoji: { type: String, required: true }
  }],
  // Quoted reply reference
  replyTo: {
    messageId: { type: String },
    senderName: { type: String },
    preview: { type: String }
  },
  // Edit tracking
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  // Message scheduling
  scheduledAt: {
    type: Date,
    default: null
  },
  isSent: {
    type: Boolean,
    default: true
  },
  // Link preview cache
  linkPreview: {
    url: String,
    title: String,
    description: String,
    image: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', MessageSchema);
