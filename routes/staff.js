const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { auth, requireRole } = require('../middleware/auth');
const { sendHospitalAdminWelcome, sendStaffWelcome } = require('../utils/mailer');

function fmt(u) {
  return {
    uid: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    deptId: u.deptId?.toString(),
    hospitalId: u.hospitalId?.toString(),
    isFirstLogin: u.isFirstLogin,
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

// POST /api/staff  — create a new staff/admin account
router.post('/', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const { name, email, password, role, hospitalId, deptId } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const plainPassword = password || 'SmartCare@123';
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    const user = await User.create({ name, email, passwordHash, role, hospitalId, deptId, isFirstLogin: true });

    if (role === 'hospital_admin' && hospitalId) {
      await Hospital.findByIdAndUpdate(hospitalId, { adminId: user._id });
    }

    if (hospitalId && (role === 'hospital_admin' || role === 'staff')) {
      try {
        const hospital = await Hospital.findById(hospitalId);
        const hospitalName = hospital?.name ?? 'your hospital';
        if (role === 'hospital_admin') {
          await sendHospitalAdminWelcome({ toEmail: email, adminName: name, hospitalName, tempPassword: plainPassword });
        } else {
          await sendStaffWelcome({ toEmail: email, staffName: name, hospitalName, tempPassword: plainPassword });
        }
      } catch (mailErr) {
        console.error('Email send failed:', mailErr.message);
      }
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
