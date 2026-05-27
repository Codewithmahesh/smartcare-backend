const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  tokenId: { type: mongoose.Schema.Types.ObjectId, ref: 'Token', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  deptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  medicines: [
    {
      name: String,
      dosage: String,
      duration: String,
      instructions: String,
    },
  ],
  bedRestDays: { type: Number, default: 0 },
  diagnosis: String,
  bedAssigned: String,
  patientName: String,
  patientContact: String,
  bedRequired: { type: Boolean, default: false },
  bedType: { type: String, enum: ['general', 'icu', 'emergency'], default: null },
  bedStatus: { type: String, enum: ['pending', 'allocated'], default: 'pending' },
  createdAt: { type: Number, default: () => Date.now() },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
