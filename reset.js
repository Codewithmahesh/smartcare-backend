require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const City = require('./models/City');
const Hospital = require('./models/Hospital');
const Department = require('./models/Department');
const Queue = require('./models/Queue');
const Token = require('./models/Token');
const Prescription = require('./models/Prescription');
const Waitlist = require('./models/Waitlist');

async function reset() {
  const NAME = process.env.SUPERADMIN_NAME;
  const EMAIL = process.env.SUPERADMIN_EMAIL;
  const PASSWORD = process.env.SUPERADMIN_PASSWORD;

  if (!NAME || !EMAIL || !PASSWORD) {
    console.error('Error: SUPERADMIN_NAME, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD must be in .env');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Wipe every collection
  const results = await Promise.all([
    User.deleteMany({}),
    City.deleteMany({}),
    Hospital.deleteMany({}),
    Department.deleteMany({}),
    Queue.deleteMany({}),
    Token.deleteMany({}),
    Prescription.deleteMany({}),
    Waitlist.deleteMany({}),
  ]);

  const [u, c, h, d, q, t, p, w] = results.map(r => r.deletedCount);
  console.log('🗑️  Cleared:');
  console.log(`   Users        : ${u}`);
  console.log(`   Cities       : ${c}`);
  console.log(`   Hospitals    : ${h}`);
  console.log(`   Departments  : ${d}`);
  console.log(`   Queues       : ${q}`);
  console.log(`   Tokens       : ${t}`);
  console.log(`   Prescriptions: ${p}`);
  console.log(`   Waitlist     : ${w}`);

  // Recreate superadmin
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  await User.create({ name: NAME, email: EMAIL, passwordHash, role: 'superadmin' });

  console.log('\n✅ Superadmin recreated');
  console.log('   Email   :', EMAIL);
  console.log('   Password:', PASSWORD);
  console.log('\nDatabase is clean. Start fresh from the admin panel.\n');
  process.exit(0);
}

reset().catch(err => { console.error(err.message); process.exit(1); });
