require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const NAME = 'Super Admin';
const EMAIL = 'admin@smartcare.com';
const PASSWORD = 'Admin@1234';

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'superadmin' });
  if (existing) {
    console.log('Superadmin already exists:', existing.email);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = await User.create({ name: NAME, email: EMAIL, passwordHash, role: 'superadmin' });
  console.log('\n✅ Superadmin created!');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('\nLogin with these credentials in the app.\n');
  process.exit(0);
}

setup().catch(err => { console.error(err.message); process.exit(1); });
