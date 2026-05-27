const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  specialty: String,
  doctorName: String,
});

module.exports = mongoose.model('Department', departmentSchema);
