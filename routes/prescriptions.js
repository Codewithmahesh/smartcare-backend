const router = require('express').Router();
const Prescription = require('../models/Prescription');
const { auth, requireRole } = require('../middleware/auth');

function fmt(p) {
  return {
    id: p._id.toString(),
    tokenId: p.tokenId.toString(),
    userId: p.userId.toString(),
    hospitalId: p.hospitalId.toString(),
    deptId: p.deptId.toString(),
    medicines: p.medicines,
    bedRestDays: p.bedRestDays,
    diagnosis: p.diagnosis,
    bedAssigned: p.bedAssigned,
    patientName: p.patientName,
    patientContact: p.patientContact,
    bedRequired: p.bedRequired,
    bedType: p.bedType,
    bedStatus: p.bedStatus,
    createdAt: p.createdAt,
    createdBy: p.createdBy.toString(),
  };
}

// GET /api/prescriptions/hospital/:hospitalId/bed-requests
router.get('/hospital/:hospitalId/bed-requests', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const requests = await Prescription.find({
      hospitalId: req.params.hospitalId,
      bedRequired: true,
      bedStatus: 'pending',
    }).sort({ createdAt: -1 });
    res.json(requests.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/prescriptions/:id/allocate-bed
router.put('/:id/allocate-bed', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const { bedNumber } = req.body;
    const p = await Prescription.findByIdAndUpdate(
      req.params.id,
      { bedAssigned: bedNumber, bedStatus: 'allocated' },
      { new: true }
    );
    if (!p) return res.status(404).json({ error: 'Prescription not found' });
    res.json(fmt(p));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prescriptions/my
router.get('/my', auth, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(prescriptions.map(fmt));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/prescriptions/:tokenId
router.get('/:tokenId', auth, async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ tokenId: req.params.tokenId });
    if (!prescription) return res.status(404).json({ error: 'Prescription not found' });
    res.json(fmt(prescription));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prescriptions
router.post('/', auth, requireRole('hospital_admin', 'staff'), async (req, res) => {
  try {
    const prescription = await Prescription.create({ ...req.body, createdBy: req.user.userId });
    res.status(201).json(fmt(prescription));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
