const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'hospital_admin', 'staff', 'patient'], required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  deptId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
  phone: String,
  isFirstLogin: { type: Boolean, default: true },
  resetCode: String,
  resetCodeExpiry: Number,
  setupToken: String,
  setupTokenExpiry: Number,
  setupOtp: String,
  setupOtpExpiry: Number,
  createdAt: { type: Number, default: () => Date.now() },
});

module.exports = mongoose.model('User', userSchema);
