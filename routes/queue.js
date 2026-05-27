const router = require('express').Router();
const Queue = require('../models/Queue');
const Token = require('../models/Token');
const { auth, requireRole } = require('../middleware/auth');

function fmt(q) {
  return {
    hospitalId: q.hospitalId.toString(),
    deptId: q.deptId.toString(),
    currentToken: q.currentToken,
    totalWaiting: q.totalWaiting,
    estimatedWaitMinutes: q.estimatedWaitMinutes,
    isOpen: q.isOpen,
  };
}

// GET /api/queue/:hospitalId/:deptId  — get live queue status (polled by app)
router.get('/:hospitalId/:deptId', async (req, res) => {
  try {
    const queue = await Queue.findOne({ hospitalId: req.params.hospitalId, deptId: req.params.deptId });
    if (!queue) return res.json({ currentToken: 0, totalWaiting: 0, estimatedWaitMinutes: 0, isOpen: true });
    res.json(fmt(queue));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/queue/:hospitalId  — all dept queues for a hospital (staff dashboard)
router.get('/:hospitalId', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const queues = await Queue.find({ hospitalId: req.params.hospitalId });
    res.json(queues.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/queue/:hospitalId/:deptId/next  — staff calls next token
router.post('/:hospitalId/:deptId/next', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const { hospitalId, deptId } = req.params;

    // Mark the current "called" token as completed if any
    await Token.updateMany(
      { hospitalId, deptId, status: 'called' },
      { status: 'completed', completedAt: Date.now() }
    );

    // Find the next waiting token
    const queue = await Queue.findOne({ hospitalId, deptId });
    const nextToken = await Token.findOne({
      hospitalId,
      deptId,
      status: 'waiting',
    }).sort({ tokenNumber: 1 });

    if (!nextToken) {
      return res.json({ message: 'No more tokens in queue', queue: queue ? fmt(queue) : null });
    }

    // Mark it called
    await Token.findByIdAndUpdate(nextToken._id, { status: 'called', calledAt: Date.now() });

    // Update queue state
    const waiting = await Token.countDocuments({ hospitalId, deptId, status: 'waiting' });
    const updated = await Queue.findOneAndUpdate(
      { hospitalId, deptId },
      { currentToken: nextToken.tokenNumber, totalWaiting: waiting, estimatedWaitMinutes: waiting * 10 },
      { new: true }
    );

    res.json({ calledToken: nextToken.tokenNumber, queue: fmt(updated) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/queue/:hospitalId/:deptId  — open/close queue
router.put('/:hospitalId/:deptId', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const queue = await Queue.findOneAndUpdate(
      { hospitalId: req.params.hospitalId, deptId: req.params.deptId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(fmt(queue));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
