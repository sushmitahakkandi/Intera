const User = require('../../models/User/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendSmsOtp } = require('../../utils/smsService');

const JWT_SECRET = process.env.JWT_SECRET || 'mahaveer-secret-key-12345';

/**
 * Register a new user (customer or admin) with mandatory phone number
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Name, email, password, and phone number are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[-+ ]/g, '');

    if (!/^\d{10}$/.test(cleanPhone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const existingPhone = await User.findOne({ phone: cleanPhone });
    if (existingPhone) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role: role === 'admin' ? 'admin' : 'customer'
    });

    await newUser.save();

    // Create JWT Token
    const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login user (customer or admin)
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Special Check: If default admin user doesn't exist yet, seed it on the fly
    if (cleanEmail === 'admin@gmail.com') {
      let adminUser = await User.findOne({ email: 'admin@gmail.com' });
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        adminUser = new User({
          name: 'Administrator',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin'
        });
        await adminUser.save();
        console.log('Seeded default admin on the fly.');
      }
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create JWT Token
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get current logged in user details
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send OTP Code to user registered phone number for password recovery
 */
const forgotPasswordPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Registered phone number or email is required' });
    }

    const inputVal = phone.trim();
    const cleanPhone = inputVal.replace(/[-+ ]/g, '');

    // Search user by registered phone or email
    const user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: inputVal },
        { email: inputVal.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'No account registered with that phone number or email.' });
    }

    if (!user.phone) {
      return res.status(400).json({ error: 'No registered phone number found on this account. Please contact support.' });
    }

    // Generate a 6-digit random code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otp;
    user.otpExpiry = expiry;
    await user.save();

    // Dispatch OTP via SMS service
    const smsResult = await sendSmsOtp(user.phone, otp);

    res.status(200).json({
      message: `OTP code generated for ${user.phone}`,
      phone: user.phone,
      otp: otp,
      provider: smsResult.providerUsed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify OTP Code for phone number
 */
const verifyOtpPhone = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone number and OTP are required' });
    }

    const inputVal = phone.trim();
    const cleanPhone = inputVal.replace(/[-+ ]/g, '');
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: inputVal },
        { email: inputVal.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Phone number or user account not found' });
    }

    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Reset password using validated OTP and phone number
 */
const resetPasswordPhone = async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    if (!phone || !otp || !newPassword) {
      return res.status(400).json({ error: 'Phone, OTP and new password are required' });
    }

    const inputVal = phone.trim();
    const cleanPhone = inputVal.replace(/[-+ ]/g, '');
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: inputVal },
        { email: inputVal.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'Phone number or user account not found' });
    }

    if (!user.otpCode || user.otpCode !== cleanOtp) {
      return res.status(400).json({ error: 'Invalid or missing OTP code verification' });
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) < new Date()) {
      return res.status(400).json({ error: 'OTP code has expired' });
    }

    // Hash and update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPasswordPhone,
  verifyOtpPhone,
  resetPasswordPhone
};
