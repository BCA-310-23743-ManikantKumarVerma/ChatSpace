const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');
// Load env vars
dotenv.config({ override: true });

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const groupRoutes = require('./routes/groupRoutes');
const pushRoutes = require('./routes/pushRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { sendNotification } = require('./controllers/pushController');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// =====================================================
// Middleware
// =====================================================
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate Limiting — auth routes only (max 15 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// XSS sanitizer — strips HTML tags from strings
const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
};

// =====================================================
// Routes
// =====================================================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/ai', aiRoutes);

// Link Preview Endpoint
app.post('/api/preview-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false });

    const ogs = require('open-graph-scraper');
    const options = { url, timeout: 5000, onlyGetOpenGraphInfo: true };
    const { error, result } = await ogs(options);

    if (error || !result.success) {
      return res.status(200).json({ success: false });
    }

    const preview = {
      url,
      title: result.ogTitle || '',
      description: result.ogDescription || '',
      image: result.ogImage?.[0]?.url || result.ogImage?.url || ''
    };
    res.status(200).json({ success: true, data: preview });
  } catch (err) {
    res.status(200).json({ success: false });
  }
});

// =====================================================
// Socket.io State
// =====================================================
const onlineUsers = new Map(); // username -> socket.id

// =====================================================
// Scheduled Messages Cron (runs every minute)
// =====================================================
cron.schedule('* * * * *', async () => {
  try {
    const Message = require('./models/Message');
    const now = new Date();

    const scheduledMsgs = await Message.find({
      scheduledAt: { $lte: now },
      isSent: false
    });

    for (const msg of scheduledMsgs) {
      msg.isSent = true;
      msg.timestamp = now;
      await msg.save();

      const messageData = {
        _id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        content: msg.content,
        type: msg.type,
        fileUrl: msg.fileUrl,
        replyTo: msg.replyTo,
        reactions: msg.reactions,
        isEdited: msg.isEdited,
        timestamp: msg.timestamp,
        scheduled: true
      };

      // Determine if group or private
      const mongoose = require('mongoose');
      const Group = require('./models/Group');
      let isGroup = false;
      if (mongoose.Types.ObjectId.isValid(msg.receiver)) {
        const group = await Group.findById(msg.receiver);
        if (group) isGroup = true;
      }

      if (isGroup) {
        io.to(msg.receiver).emit('groupMessage', messageData);
      } else {
        const receiverSocketId = onlineUsers.get(msg.receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('privateMessage', messageData);
        }
        const senderSocketId = onlineUsers.get(msg.sender);
        if (senderSocketId) {
          io.to(senderSocketId).emit('privateMessage', messageData);
        }
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// =====================================================
// Socket.io Logic
// =====================================================
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins the chat
  socket.on('join', async (username) => {
    socket.username = username;
    onlineUsers.set(username, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`${username} joined.`);

    // Automatically join all groups the user is a part of
    try {
      const Group = require('./models/Group');
      const groups = await Group.find({ members: username });
      groups.forEach(g => socket.join(g._id.toString()));
    } catch (err) {
      console.error('Error joining groups', err);
    }
  });

  // Listen for private chat messages
  socket.on('privateMessage', async ({ receiver, text, type, fileUrl, replyTo, scheduledAt }) => {
    const Message = require('./models/Message');
    try {
      if (socket.username && receiver) {
        const safeText = sanitize(text);
        const isSent = !scheduledAt || new Date(scheduledAt) <= new Date();

        const savedMsg = await Message.create({
          sender: socket.username,
          receiver,
          content: safeText,
          type: type || 'text',
          fileUrl: fileUrl || null,
          replyTo: replyTo || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          isSent
        });

        if (!isSent) {
          // Acknowledge scheduling to sender only
          socket.emit('messageScheduled', { 
            scheduledAt, 
            preview: safeText?.substring(0, 50) 
          });
          return;
        }

        const messageData = {
          _id: savedMsg._id,
          sender: socket.username,
          receiver,
          content: safeText,
          type: savedMsg.type,
          fileUrl: savedMsg.fileUrl,
          replyTo: savedMsg.replyTo,
          reactions: [],
          isEdited: false,
          timestamp: savedMsg.timestamp
        };

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiver);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('privateMessage', messageData);
        } else {
          // Push notification for offline receiver
          sendNotification(receiver, {
            title: `New message from ${socket.username}`,
            body: safeText || 'Sent an attachment',
            url: '/'
          });
        }

        // Send back to sender
        socket.emit('privateMessage', messageData);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Listen for group messages
  socket.on('groupMessage', async ({ groupId, text, type, fileUrl, replyTo, scheduledAt }) => {
    const Message = require('./models/Message');
    const Group = require('./models/Group');
    try {
      if (socket.username && groupId) {
        const safeText = sanitize(text);
        const isSent = !scheduledAt || new Date(scheduledAt) <= new Date();

        const savedMsg = await Message.create({
          sender: socket.username,
          receiver: groupId,
          content: safeText,
          type,
          fileUrl,
          replyTo: replyTo || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          isSent
        });

        if (!isSent) {
          socket.emit('messageScheduled', { scheduledAt, preview: safeText?.substring(0, 50) });
          return;
        }

        const messageData = {
          _id: savedMsg._id,
          sender: socket.username,
          receiver: groupId,
          content: safeText,
          type,
          fileUrl,
          replyTo: savedMsg.replyTo,
          reactions: [],
          isEdited: false,
          timestamp: savedMsg.timestamp
        };

        // Broadcast to group room
        io.to(groupId).emit('groupMessage', messageData);

        // Send push notifications to offline group members
        const group = await Group.findById(groupId);
        if (group) {
          group.members.forEach(member => {
            if (member !== socket.username && !onlineUsers.has(member)) {
              sendNotification(member, {
                title: `New message in ${group.name} from ${socket.username}`,
                body: safeText || 'Sent an attachment',
                url: '/'
              });
            }
          });
        }
      }
    } catch (err) {
      console.error('Error saving group message:', err);
    }
  });

  // ---- Emoji Reactions ----
  socket.on('reactMessage', async ({ messageId, emoji, receiver, isGroup }) => {
    const Message = require('./models/Message');
    try {
      if (!socket.username || !messageId || !emoji) return;

      const msg = await Message.findById(messageId);
      if (!msg) return;

      // Toggle reaction: remove if same user+emoji exists, else add
      const existingIdx = msg.reactions.findIndex(
        r => r.user === socket.username && r.emoji === emoji
      );

      if (existingIdx > -1) {
        msg.reactions.splice(existingIdx, 1);
      } else {
        // Remove any previous reaction from this user first (one reaction per user)
        const prevIdx = msg.reactions.findIndex(r => r.user === socket.username);
        if (prevIdx > -1) msg.reactions.splice(prevIdx, 1);
        msg.reactions.push({ user: socket.username, emoji });
      }
      await msg.save();

      const reactionData = { messageId, reactions: msg.reactions };

      if (isGroup) {
        io.to(receiver).emit('messageReacted', reactionData);
      } else {
        const senderSocketId = onlineUsers.get(msg.sender);
        const receiverSocketId = onlineUsers.get(msg.receiver);
        if (senderSocketId) io.to(senderSocketId).emit('messageReacted', reactionData);
        if (receiverSocketId && receiverSocketId !== senderSocketId) {
          io.to(receiverSocketId).emit('messageReacted', reactionData);
        }
      }
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  });

  // ---- Edit Message ----
  socket.on('editMessage', async ({ messageId, newContent, receiver, isGroup }) => {
    const Message = require('./models/Message');
    try {
      if (!socket.username || !messageId || !newContent) return;

      const msg = await Message.findById(messageId);
      if (!msg || msg.sender !== socket.username) return;

      const safeContent = sanitize(newContent);
      msg.content = safeContent;
      msg.isEdited = true;
      msg.editedAt = new Date();
      await msg.save();

      const editData = {
        messageId,
        newContent: safeContent,
        isEdited: true,
        editedAt: msg.editedAt
      };

      if (isGroup) {
        io.to(receiver).emit('messageEdited', editData);
      } else {
        const senderSocketId = onlineUsers.get(socket.username);
        const receiverSocketId = onlineUsers.get(receiver);
        if (senderSocketId) io.to(senderSocketId).emit('messageEdited', editData);
        if (receiverSocketId) io.to(receiverSocketId).emit('messageEdited', editData);
      }
    } catch (err) {
      console.error('Error editing message:', err);
    }
  });

  // ---- Forward Message ----
  socket.on('forwardMessage', async ({ messageId, forwardTo, isGroupTarget }) => {
    const Message = require('./models/Message');
    const Group = require('./models/Group');
    try {
      if (!socket.username || !messageId || !forwardTo) return;

      const originalMsg = await Message.findById(messageId);
      if (!originalMsg) return;

      const savedMsg = await Message.create({
        sender: socket.username,
        receiver: forwardTo,
        content: originalMsg.content,
        type: originalMsg.type,
        fileUrl: originalMsg.fileUrl
      });

      const messageData = {
        _id: savedMsg._id,
        sender: socket.username,
        receiver: forwardTo,
        content: savedMsg.content,
        type: savedMsg.type,
        fileUrl: savedMsg.fileUrl,
        reactions: [],
        isEdited: false,
        isForwarded: true,
        timestamp: savedMsg.timestamp
      };

      if (isGroupTarget) {
        io.to(forwardTo).emit('groupMessage', messageData);
      } else {
        const receiverSocketId = onlineUsers.get(forwardTo);
        if (receiverSocketId) io.to(receiverSocketId).emit('privateMessage', messageData);
        socket.emit('privateMessage', messageData);
      }
    } catch (err) {
      console.error('Error forwarding message:', err);
    }
  });

  // ---- E2E Key Exchange (ECDH public key relay) ----
  // Server only relays public keys — never sees plaintext or private keys
  socket.on('e2ePublicKey', ({ to, publicKeyJwk }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('e2ePublicKey', {
        from: socket.username,
        publicKeyJwk
      });
    }
  });

  socket.on('e2ePublicKeyAck', ({ to, publicKeyJwk }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('e2ePublicKeyAck', {
        from: socket.username,
        publicKeyJwk
      });
    }
  });

  // Handle typing indicator (private)
  socket.on('typing', ({ receiver }) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { sender: socket.username });
    }
  });

  socket.on('stopTyping', ({ receiver }) => {
    const receiverSocketId = onlineUsers.get(receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping', { sender: socket.username });
    }
  });

  // Handle typing indicator (group)
  socket.on('groupTyping', ({ groupId }) => {
    socket.to(groupId).emit('groupTyping', { sender: socket.username, groupId });
  });

  socket.on('groupStopTyping', ({ groupId }) => {
    socket.to(groupId).emit('groupStopTyping', { sender: socket.username, groupId });
  });

  // Handle read receipts
  socket.on('markRead', async ({ sender }) => {
    const Message = require('./models/Message');
    try {
      if (socket.username && sender) {
        await Message.updateMany(
          { sender, receiver: socket.username, read: false },
          { $set: { read: true } }
        );

        const senderSocketId = onlineUsers.get(sender);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messagesRead', { reader: socket.username });
        }
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  // Handle message deletion (delete for everyone)
  socket.on('deleteMessage', async ({ messageId }) => {
    const Message = require('./models/Message');
    try {
      if (socket.username && messageId) {
        const msg = await Message.findById(messageId);
        if (msg && msg.sender === socket.username) {
          await Message.findByIdAndDelete(messageId);
          io.emit('messageDeleted', { messageId, receiver: msg.receiver });
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  // Handle bulk "Delete For Me"
  socket.on('deleteMessagesForMe', async ({ messageIds }) => {
    const Message = require('./models/Message');
    try {
      if (socket.username && Array.isArray(messageIds) && messageIds.length > 0) {
        await Message.updateMany(
          { _id: { $in: messageIds } },
          { $addToSet: { deletedBy: socket.username } }
        );
      }
    } catch (err) {
      console.error('Error deleting messages for me:', err);
    }
  });

  // WebRTC Signaling
  socket.on('callUser', ({ userToCall, offer }) => {
    const receiverSocketId = onlineUsers.get(userToCall);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('incomingCall', {
        from: socket.username,
        offer
      });
    }
  });

  socket.on('answerCall', ({ to, answer }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callAnswered', { answer });
    }
  });

  socket.on('iceCandidate', ({ to, candidate }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('iceCandidate', { candidate });
    }
  });

  socket.on('declineCall', ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callDeclined');
    }
  });

  socket.on('endCall', ({ to }) => {
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('callEnded');
    }
  });

  // Runs when client disconnects
  socket.on('disconnect', async () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`${socket.username} disconnected.`);

      // Update lastSeen
      try {
        const User = require('./models/User');
        await User.findOneAndUpdate({ username: socket.username }, { lastSeen: new Date() });
      } catch (err) {
        console.error('Error updating lastSeen', err);
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
