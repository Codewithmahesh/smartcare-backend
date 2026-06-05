const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { auth, requireRole } = require('../middleware/auth');
const { sendSetupOtp } = require('../utils/mailer');

function fmt(u) {
  return {
    uid: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    deptId: u.deptId?.toString(),
    hospitalId: u.hospitalId?.toString(),
    isFirstLogin: u.isFirstLogin,
    setupPending: u.isFirstLogin && !!u.setupOtp,
  };
}

// GET /api/staff/:hospitalId
router.get('/:hospitalId', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const staff = await User.find({
      hospitalId: req.params.hospitalId,
      role: { $in: ['hospital_admin', 'staff'] },
    });
    res.json(staff.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff — create a new staff/admin account (OTP invite flow)
router.post('/', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const { name, email, role, hospitalId, deptId } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const setupOtp = String(Math.floor(100000 + Math.random() * 900000));
    const setupOtpExpiry = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

    // Throwaway hash — account unusable until OTP activation (1 round = fast, irrelevant here)
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 1);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      hospitalId,
      deptId,
      isFirstLogin: true,
      setupOtp,
      setupOtpExpiry,
    });

    const hospital = hospitalId ? await Hospital.findById(hospitalId) : null;

    if (role === 'hospital_admin' && hospitalId) {
      await Hospital.findByIdAndUpdate(hospitalId, { adminId: user._id });
    }

    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    sendSetupOtp({ toEmail: email, name, hospitalName: hospital?.name ?? 'SmartCare', otp: setupOtp, role, adminUrl }).catch(err => {
      console.error('[Invite OTP email error]', err.message);
    });

    console.log(`\n[Invite OTP] ${name} <${email}> — OTP: ${setupOtp}\n`);

    res.status(201).json(fmt(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/staff/:id/resend-otp — resend activation OTP
router.post('/:id/resend-otp', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isFirstLogin) return res.status(400).json({ error: 'Account is already activated' });

    const setupOtp = String(Math.floor(100000 + Math.random() * 900000));
    const setupOtpExpiry = Date.now() + 48 * 60 * 60 * 1000;
    await User.findByIdAndUpdate(user._id, { setupOtp, setupOtpExpiry });

    const hospital = user.hospitalId ? await Hospital.findById(user.hospitalId) : null;
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

    sendSetupOtp({ toEmail: user.email, name: user.name, hospitalName: hospital?.name ?? 'SmartCare', otp: setupOtp, role: user.role, adminUrl }).catch(err => {
      console.error('[Resend OTP email error]', err.message);
    });

    console.log(`\n[Resend OTP] ${user.name} <${user.email}> — OTP: ${setupOtp}\n`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/staff/:id
router.put('/:id', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const { name, deptId, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, deptId, role }, { new: true });
    if (!user) return res.status(404).json({ error: 'Staff member not found' });
    res.json(fmt(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
