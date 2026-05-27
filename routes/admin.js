const router = require('express').Router();
const City = require('../models/City');
const Hospital = require('../models/Hospital');
const User = require('../models/User');
const Waitlist = require('../models/Waitlist');
const { auth, requireRole } = require('../middleware/auth');

// GET /api/admin/stats
router.get('/stats', auth, requireRole('superadmin', 'hospital_admin'), async (req, res) => {
  try {
    const [cities, hospitals, patients, waitlistCount] = await Promise.all([
      City.find(),
      Hospital.find(),
      User.countDocuments({ role: 'patient' }),
      Waitlist.countDocuments(),
    ]);

    res.json({
      totalCities: cities.length,
      liveCities: cities.filter(c => c.isLive).length,
      totalHospitals: hospitals.length,
      activeHospitals: hospitals.filter(h => h.isActive).length,
      totalPatients: patients,
      totalWaitlist: waitlistCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
