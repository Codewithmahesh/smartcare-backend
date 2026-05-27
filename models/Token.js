const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  userPhone: String,
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  hospitalName: String,
  deptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  deptName: String,
  tokenNumber: { type: Number, required: true },
  status: { type: String, enum: ['waiting', 'called', 'completed', 'cancelled'], default: 'waiting' },
  appointmentDate: { type: String, default: () => toIST(new Date()) },
  createdAt: { type: Number, default: () => Date.now() },
  calledAt: Number,
  completedAt: Number,
});

function toIST(d) {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
}

module.exports = mongoose.model('Token', tokenSchema);
