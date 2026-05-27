const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true },
  state: { type: String, required: true },
  isLive: { type: Boolean, default: false },
  waitlistCount: { type: Number, default: 0 },
});

module.exports = mongoose.model('City', citySchema);
