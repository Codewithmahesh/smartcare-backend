const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  deptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  currentToken: { type: Number, default: 0 },
  totalWaiting: { type: Number, default: 0 },
  estimatedWaitMinutes: { type: Number, default: 0 },
  isOpen: { type: Boolean, default: true },
  counter: { type: Number, default: 0 },
});

queueSchema.index({ hospitalId: 1, deptId: 1 }, { unique: true });

module.exports = mongoose.model('Queue', queueSchema);
