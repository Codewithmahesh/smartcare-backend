const router = require('express').Router();
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

function fmt(h) {
  return {
    id: h._id.toString(),
    name: h.name,
    cityId: h.cityId?.toString(),
    address: h.address,
    lat: h.lat,
    lng: h.lng,
    phone: h.phone,
    email: h.email,
    specialties: h.specialties,
    isActive: h.isActive,
    adminId: h.adminId?.toString(),
    beds: h.beds,
  };
}

function fmtDept(d) {
  return { id: d._id.toString(), hospitalId: d.hospitalId.toString(), name: d.name, specialty: d.specialty, doctorName: d.doctorName };
}

// GET /api/hospitals
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.cityId) filter.cityId = req.query.cityId;
    const hospitals = await Hospital.find(filter).sort({ name: 1 });
    res.json(hospitals.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals/:id
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(fmt(hospital));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hospitals
router.post('/', auth, requireRole('superadmin'), async (req, res) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json(fmt(hospital));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hospitals/:id
router.put('/:id', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(fmt(hospital));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hospitals/:id
router.delete('/:id', auth, requireRole('superadmin'), async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    await Department.deleteMany({ hospitalId: req.params.id });
    await User.deleteMany({ hospitalId: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals/:id/departments
router.get('/:id/departments', async (req, res) => {
  try {
    const depts = await Department.find({ hospitalId: req.params.id });
    res.json(depts.map(fmtDept));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hospitals/:id/departments
router.post('/:id/departments', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const dept = await Department.create({ ...req.body, hospitalId: req.params.id });
    res.status(201).json(fmtDept(dept));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hospitals/:id/departments/:deptId
router.put('/:id/departments/:deptId', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.deptId, req.body, { new: true });
    if (!dept) return res.status(404).json({ error: 'Department not found' });
    res.json(fmtDept(dept));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hospitals/:id/departments/:deptId
router.delete('/:id/departments/:deptId', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.deptId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hospitals/:id/beds
router.get('/:id/beds', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id, 'beds');
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(hospital.beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hospitals/:id/beds
router.put('/:id/beds', auth, requireRole('superadmin', 'hospital_admin', 'staff'), async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { beds: req.body },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ error: 'Hospital not found' });
    res.json(hospital.beds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
