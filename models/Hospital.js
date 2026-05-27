const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  contact: { type: String, required: true },
  contactType: { type: String, enum: ['phone', 'email'], required: true },
  bedNumber: { type: String, required: true },
  admittedAt: { type: Number, default: () => Date.now() },
});

const bedCountSchema = new mongoose.Schema({
  total: { type: Number, default: 0 },
  occupied: { type: Number, default: 0 },
  admissions: { type: [admissionSchema], default: [] },
}, { _id: false });

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  address: { type: String, required: true },
  lat: Number,
  lng: Number,
  phone: String,
  email: String,
  specialties: [String],
  isActive: { type: Boolean, default: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  beds: {
    general: { type: bedCountSchema, default: () => ({ total: 0, occupied: 0, admissions: [] }) },
    icu: { type: bedCountSchema, default: () => ({ total: 0, occupied: 0, admissions: [] }) },
    emergency: { type: bedCountSchema, default: () => ({ total: 0, occupied: 0, admissions: [] }) },
  },
});

module.exports = mongoose.model('Hospital', hospitalSchema);
