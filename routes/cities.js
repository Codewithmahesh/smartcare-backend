const router = require('express').Router();
const City = require('../models/City');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

function fmt(c) {
  return { id: c._id.toString(), name: c.name, state: c.state, isLive: c.isLive, waitlistCount: c.waitlistCount };
}

// GET /api/cities
router.get('/', async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    res.json(cities.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cities
router.post('/', auth, requireRole('superadmin'), async (req, res) => {
  try {
    const city = await City.create(req.body);
    res.status(201).json(fmt(city));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cities/:id
router.put('/:id', auth, requireRole('superadmin'), async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return res.status(404).json({ error: 'City not found' });
    res.json(fmt(city));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/cities/:id  — cascades: hospitals → their depts + staff → city
router.delete('/:id', auth, requireRole('superadmin'), async (req, res) => {
  try {
    const hospitals = await Hospital.find({ cityId: req.params.id });
    for (const h of hospitals) {
      await Department.deleteMany({ hospitalId: h._id });
      await User.deleteMany({ hospitalId: h._id });
      await Hospital.findByIdAndDelete(h._id);
    }
    await City.findByIdAndDelete(req.params.id);
    res.json({ success: true, deletedHospitals: hospitals.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
