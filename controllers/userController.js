const User = require('../models/User');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('username _id profilePic lastSeen createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('username fullName email profilePic bio createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const { fullName, email, bio } = req.body;

    // Full name validation: only letters and spaces allowed
    if (fullName) {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(fullName)) {
        return res.status(400).json({ success: false, message: 'Full name must only contain letters and spaces' });
      }
    }

    const user = await User.findOneAndUpdate(
      { username },
      { fullName, email, bio },
      { new: true, runValidators: true }
    ).select('username fullName email profilePic bio');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
