const router = require('express').Router();
const Waitlist = require('../models/Waitlist');
const City = require('../models/City');
const { auth, requireRole } = require('../middleware/auth');

// POST /api/waitlist/:cityId  — patient joins waitlist
router.post('/:cityId', auth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    await Waitlist.findOneAndUpdate(
      { cityId: req.params.cityId, userId: req.user.userId },
      { cityId: req.params.cityId, userId: req.user.userId, name, email, phone, joinedAt: Date.now() },
      { upsert: true }
    );
    await City.findByIdAndUpdate(req.params.cityId, { $inc: { waitlistCount: 1 } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/waitlist/:cityId  — admin reads waitlist
router.get('/:cityId', auth, requireRole('superadmin'), async (req, res) => {
  try {
    const entries = await Waitlist.find({ cityId: req.params.cityId }).sort({ joinedAt: -1 });
    res.json(entries.map(e => ({
      id: e._id.toString(),
      cityId: e.cityId.toString(),
      userId: e.userId?.toString(),
      name: e.name,
      email: e.email,
      phone: e.phone,
      joinedAt: e.joinedAt,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
