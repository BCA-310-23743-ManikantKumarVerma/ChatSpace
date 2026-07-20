const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


let transporter;
if (process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

const sendOTPEmail = async (email, otp, subject) => {
  if (!transporter && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  if (transporter) {
    try {
      console.log(`[SMTP] Sending real OTP email to: ${email}...`);
      const info = await transporter.sendMail({
        from: `"ChatSpace" <${process.env.SMTP_USER}>`,
        to: email,
        subject: subject,
        text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
      });
      console.log(`[SMTP] Email sent successfully! MessageId: ${info.messageId}`);
    } catch (error) {
      console.error(`[SMTP ERROR] Failed to send email to ${email}:`, error);
      throw new Error(`Email delivery failed: ${error.message}`);
    }
  } else {
    console.log(`\n=========================================\n[EMAIL MOCK] To: ${email}\nSubject: ${subject}\nOTP: ${otp}\n=========================================\n`);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, password, fullName, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ success: false, message: 'Please provide username, password, and email' });
    }

    // Full name validation: only letters and spaces allowed
    if (fullName) {
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(fullName)) {
        return res.status(400).json({ success: false, message: 'Full name must only contain letters and spaces' });
      }
    }

    // Password validation: at least 1 uppercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters and contain at least one uppercase letter, one number, and one special character.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingUser && !existingUser.isEmailVerified) {
      existingUser.password = hashedPassword;
      existingUser.fullName = fullName;
      existingUser.email = email;
      existingUser.emailOTP = otp;
      existingUser.emailOTPExpires = otpExpires;
      await existingUser.save();
    } else {
      await User.create({
        username,
        password: hashedPassword,
        fullName: fullName || '',
        email,
        emailOTP: otp,
        emailOTPExpires: otpExpires,
        isEmailVerified: false
      });
    }

    await sendOTPEmail(email, otp, 'Your ChatSpace Registration OTP');

    res.status(200).json({
      success: true,
      message: 'OTP sent to email',
      requireOTP: true
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify OTP for Registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;
    
    if (!username || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide username and OTP' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.emailOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.emailOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpires = undefined;
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      username: user.username,
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide a username and password' });
    }

    const user = await User.findOne({ username }).select('+password');

    if (!user || !user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or unverified account' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    res.status(200).json({
      success: true,
      token,
      username: user.username,
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { identity } = req.body; // Can be username or email

    if (!identity) {
      return res.status(400).json({ success: false, message: 'Please provide your email or username' });
    }

    const user = await User.findOne({ $or: [{ email: identity }, { username: identity }] });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email/username' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60000); // 10 minutes
    await user.save();

    await sendOTPEmail(user.email, otp, 'Your ChatSpace Password Reset OTP');

    res.status(200).json({ success: true, message: 'Password reset OTP sent to email', username: user.username });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password must contain at least one uppercase letter, one number, and one special character.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password successfully reset' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to generate refresh token
const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

// @desc    Refresh JWT using refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    // Issue new JWT
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      token,
      refreshToken: newRefreshToken,
      username: user.username,
      profilePic: user.profilePic
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

