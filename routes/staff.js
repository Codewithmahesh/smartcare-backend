const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { auth, requireRole } = require('../middleware/auth');
const { sendSetupInvite } = require('../utils/mailer');

function fmt(u) {
  return {
    uid: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    deptId: u.deptId?.toString(),
    hospitalId: u.hospitalId?.toString(),
    isFirstLogin: u.isFirstLogin,
    setupPending: !!u.setupToken,
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

// POST /api/staff — create a new staff/admin account (invite flow)
router.post('/', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const { name, email, role, hospitalId, deptId } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    // Generate a setup token (no temp password)
    const setupToken = crypto.randomBytes(32).toString('hex');
    const setupTokenExpiry = Date.now() + 48 * 60 * 60 * 1000; // 48 hours

    // Placeholder hash — account is unusable until they set a password via the setup link
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      hospitalId,
      deptId,
      isFirstLogin: true,
      setupToken,
      setupTokenExpiry,
    });

    if (role === 'hospital_admin' && hospitalId) {
      await Hospital.findByIdAndUpdate(hospitalId, { adminId: user._id });
    }

    // Send invite email with setup link
    try {
      const hospital = await Hospital.findById(hospitalId);
      const hospitalName = hospital?.name ?? 'your hospital';
      const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
      const setupUrl = `${adminUrl}/setup-password?token=${setupToken}`;
      await sendSetupInvite({ toEmail: email, name, hospitalName, setupUrl, role });
    } catch (mailErr) {
      console.error('[Mailer] Failed to send invite:', mailErr.message);
    }

    res.status(201).json(fmt(user));
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
