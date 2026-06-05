require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function setup() {
  const NAME = process.env.SUPERADMIN_NAME;
  const EMAIL = process.env.SUPERADMIN_EMAIL;
  const PASSWORD = process.env.SUPERADMIN_PASSWORD;

  if (!NAME || !EMAIL || !PASSWORD) {
    console.error('Error: SUPERADMIN_NAME, SUPERADMIN_EMAIL, and SUPERADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log('Superadmin already exists:', existing.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await User.create({ name: NAME, email: EMAIL, passwordHash, role: 'superadmin' });
  console.log('\n✅ Superadmin created!');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('\nLogin with these credentials in the app.\n');
  process.exit(0);
}

setup().catch(err => { console.error(err.message); process.exit(1); });
