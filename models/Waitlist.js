const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  email: String,
  phone: String,
  joinedAt: { type: Number, default: () => Date.now() },
});

waitlistSchema.index({ cityId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
