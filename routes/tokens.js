const router = require('express').Router();
const Token = require('../models/Token');
const Queue = require('../models/Queue');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const { auth, requireRole } = require('../middleware/auth');

function fmt(t) {
  return {
    id: t._id.toString(),
    userId: t.userId.toString(),
    userName: t.userName,
    userPhone: t.userPhone,
    hospitalId: t.hospitalId.toString(),
    hospitalName: t.hospitalName,
    deptId: t.deptId.toString(),
    deptName: t.deptName,
    tokenNumber: t.tokenNumber,
    status: t.status,
    appointmentDate: t.appointmentDate,
    createdAt: t.createdAt,
    calledAt: t.calledAt,
    completedAt: t.completedAt,
  };
}

function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// POST /api/tokens  — patient books a token or schedules appointment
router.post('/', auth, requireRole('patient'), async (req, res) => {
  try {
    const { hospitalId, deptId, appointmentDate } = req.body;
    const User = require('../models/User');

    const today = todayIST();
    const apptDate = appointmentDate || today;
    const isWalkIn = apptDate === today;

    const [hospital, dept, user] = await Promise.all([
      Hospital.findById(hospitalId),
      Department.findById(deptId),
      User.findById(req.user.userId),
    ]);
    if (!hospital || !dept) return res.status(404).json({ error: 'Hospital or department not found' });

    // Walk-in: increment counter + waiting count. Scheduled: increment counter only.
    const queueUpdate = isWalkIn
      ? { $inc: { counter: 1, totalWaiting: 1 } }
      : { $inc: { counter: 1 } };

    const queue = await Queue.findOneAndUpdate(
      { hospitalId, deptId },
      queueUpdate,
      { upsert: true, new: true }
    );

    if (isWalkIn) {
      queue.estimatedWaitMinutes = queue.totalWaiting * 10;
      await queue.save();
    }

    const token = await Token.create({
      userId: req.user.userId,
      userName: user?.name ?? 'Patient',
      userPhone: user?.phone ?? '',
      hospitalId,
      hospitalName: hospital.name,
      deptId,
      deptName: dept.name,
      tokenNumber: queue.counter,
      status: 'waiting',
      appointmentDate: apptDate,
    });

    res.status(201).json(fmt(token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/my  — patient's own tokens
router.get('/my', auth, async (req, res) => {
  try {
    const tokens = await Token.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(tokens.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ error: 'Token not found' });
    res.json(fmt(token));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tokens/:id/status  — patient cancels or staff calls/completes
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const token = await Token.findById(req.params.id);
    if (!token) return res.status(404).json({ error: 'Token not found' });

    const update = { status };
    if (status === 'called') update.calledAt = Date.now();
    if (status === 'completed') update.completedAt = Date.now();

    // If cancelling or completing, decrease waiting count
    if ((status === 'cancelled' || status === 'completed') && token.status === 'waiting') {
      await Queue.findOneAndUpdate(
        { hospitalId: token.hospitalId, deptId: token.deptId },
        { $inc: { totalWaiting: -1 } }
      );
    }

    const updated = await Token.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(fmt(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tokens/hospital/:hospitalId/dept/:deptId  — staff sees today's queue
router.get('/hospital/:hospitalId/dept/:deptId', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const today = todayIST();
    const filter = {
      hospitalId: req.params.hospitalId,
      status: { $in: ['waiting', 'called'] },
      $or: [{ appointmentDate: today }, { appointmentDate: { $exists: false } }],
    };
    if (req.params.deptId !== 'all') filter.deptId = req.params.deptId;
    const tokens = await Token.find(filter).sort({ tokenNumber: 1 });
    res.json(tokens.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
