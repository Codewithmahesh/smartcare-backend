const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../utils/mailer');

function signToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      hospitalId: user.hospitalId?.toString(),
      deptId: user.deptId?.toString(),
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

function formatUser(user) {
  return {
    uid: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId?.toString(),
    deptId: user.deptId?.toString(),
    cityId: user.cityId?.toString(),
    phone: user.phone,
    isFirstLogin: user.isFirstLogin,
    createdAt: user.createdAt,
  };
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, identifier } = req.body;
    const id = identifier || email;
    if (!id || !password) return res.status(400).json({ error: 'Email/phone and password required' });

    const isEmail = /\S+@\S+\.\S+/.test(id);
    const user = isEmail
      ? await User.findOne({ email: id.toLowerCase() })
      : await User.findOne({ phone: id });
    if (!user) return res.status(401).json({ code: 'auth/user-not-found', error: `No account found with this ${isEmail ? 'email' : 'phone number'}` });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ code: 'auth/wrong-password', error: 'Incorrect password' });

    res.json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user.userId, { passwordHash: hash, isFirstLogin: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/me  — update profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, cityId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, cityId },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/setup  — create first superadmin (only works when no superadmin exists)
router.post('/setup', async (req, res) => {
  try {
    const existing = await User.findOne({ role: 'superadmin' });
    if (existing) return res.status(409).json({ error: 'Superadmin already exists. Use /login instead.' });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'superadmin' });
    res.status(201).json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/signup  — patient self-registration (public)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, cityId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ code: 'auth/email-already-in-use', error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email: email.toLowerCase(), passwordHash, role: 'patient', phone, cityId });
    res.status(201).json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register  (internal use — create superadmin or first user)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, hospitalId, deptId, cityId, phone } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: undefined, passwordHash, role, hospitalId, deptId, cityId, phone });
    res.status(201).json({ token: signToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await User.findByIdAndUpdate(user._id, { resetCode: code, resetCodeExpiry: expiry });

    await sendPasswordResetEmail({ toEmail: user.email, name: user.name, code });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ error: 'Email, code and new password are required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: 'No account found with this email' });
    if (!user.resetCode || user.resetCode !== code) return res.status(400).json({ code: 'invalid_code', error: 'Invalid reset code' });
    if (Date.now() > user.resetCodeExpiry) return res.status(400).json({ code: 'code_expired', error: 'Reset code has expired. Please request a new one.' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { passwordHash, resetCode: null, resetCodeExpiry: null, isFirstLogin: false });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
