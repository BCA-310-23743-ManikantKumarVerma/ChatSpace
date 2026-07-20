const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Public
exports.createGroup = async (req, res) => {
  try {
    const { name, admin, members } = req.body;
    
    if (!name || !admin) {
      return res.status(400).json({ success: false, message: 'Please provide group name and admin' });
    }

    // Ensure admin is in the members list
    let groupMembers = members || [];
    if (!groupMembers.includes(admin)) {
      groupMembers.push(admin);
    }

    const group = await Group.create({
      name,
      admin,
      members: groupMembers
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's groups
// @route   GET /api/groups/:username
// @access  Public
exports.getGroups = async (req, res) => {
  try {
    const { username } = req.params;
    const groups = await Group.find({ members: username });
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a member to a group
// @route   PUT /api/groups/:id/members
// @access  Public
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Please provide a username' });
    }

    // Check if user exists in database
    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User does not exist' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.members.includes(username)) {
      return res.status(400).json({ success: false, message: 'User is already a member of this group' });
    }

    group.members.push(username);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a member from a group
// @route   DELETE /api/groups/:id/members/:username
// @access  Public
exports.removeMember = async (req, res) => {
  try {
    const { id, username } = req.params;
    const { adminUsername } = req.body;

    if (!adminUsername) {
      return res.status(400).json({ success: false, message: 'Please provide admin username' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.admin !== adminUsername) {
      return res.status(403).json({ success: false, message: 'Only the admin can remove members' });
    }

    if (group.admin === username) {
      return res.status(400).json({ success: false, message: 'Admin cannot be removed. Transfer admin rights or leave group.' });
    }

    group.members = group.members.filter(member => member !== username);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer admin rights
// @route   PUT /api/groups/:id/admin
// @access  Public
exports.transferAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUsername, newAdminUsername } = req.body;

    if (!adminUsername || !newAdminUsername) {
      return res.status(400).json({ success: false, message: 'Please provide current admin and new admin usernames' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.admin !== adminUsername) {
      return res.status(403).json({ success: false, message: 'Only the current admin can transfer admin rights' });
    }

    if (!group.members.includes(newAdminUsername)) {
      return res.status(400).json({ success: false, message: 'New admin must be a member of the group' });
    }

    group.admin = newAdminUsername;
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave a group
// @route   DELETE /api/groups/:id/leave
// @access  Public
exports.leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: 'Please provide username' });
    }

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.admin === username) {
      if (group.members.length > 1) {
        return res.status(400).json({ success: false, message: 'You must transfer admin rights before leaving the group' });
      } else {
        // If admin is the only member, delete the group
        await Group.findByIdAndDelete(id);
        return res.status(200).json({ success: true, message: 'Group deleted as the last member left' });
      }
    }

    group.members = group.members.filter(member => member !== username);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Pin a message in a group
// @route   PATCH /api/groups/:id/pin
// @access  Public (admin only)
exports.pinMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { messageId, adminUsername } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (group.admin !== adminUsername) {
      return res.status(403).json({ success: false, message: 'Only the admin can pin messages' });
    }

    group.pinnedMessage = messageId || null;
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

