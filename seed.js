require('dotenv').config();
const mongoose = require('mongoose');

const City = require('./models/City');
const Hospital = require('./models/Hospital');
const Department = require('./models/Department');
const Queue = require('./models/Queue');
const User = require('./models/User');

// ─── Seed Data ───────────────────────────────────────────────────────────────

const CITIES = [
  { name: 'Chennai',    state: 'Tamil Nadu',  isLive: true },
  { name: 'Coimbatore', state: 'Tamil Nadu',  isLive: true },
  { name: 'Mumbai',     state: 'Maharashtra', isLive: true },
  { name: 'Bangalore',  state: 'Karnataka',   isLive: true },
  { name: 'Hyderabad',  state: 'Telangana',   isLive: false },
  { name: 'Delhi',      state: 'Delhi',       isLive: false },
];

const HOSPITALS = [
  {
    cityKey: 'Chennai',
    name: 'Apollo Hospital',
    address: '21 Greams Lane, Off Greams Road, Chennai - 600006',
    phone: '044-28293333',
    email: 'info@apollo-chennai.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Surgery'],
    beds: { general: 80, icu: 20, emergency: 15 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',       doctorName: 'Dr. Ramesh Iyer' },
      { name: 'Neurology OPD',    specialty: 'Neurology',        doctorName: 'Dr. Priya Suresh' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics',      doctorName: 'Dr. Karthik Nair' },
      { name: 'Oncology OPD',     specialty: 'Oncology',         doctorName: 'Dr. Meena Raj' },
      { name: 'Emergency',        specialty: 'Emergency Medicine', doctorName: '' },
    ],
  },
  {
    cityKey: 'Chennai',
    name: 'Government General Hospital',
    address: 'Park Town, Chennai - 600003',
    phone: '044-25305000',
    email: 'info@ggh-chennai.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'Dermatology'],
    beds: { general: 200, icu: 40, emergency: 30 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Anand Kumar' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Kavitha M' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Sumathi R' },
      { name: 'ENT OPD',          specialty: 'ENT',              doctorName: 'Dr. Bala S' },
      { name: 'Dermatology OPD',  specialty: 'Dermatology',      doctorName: 'Dr. Deepa N' },
    ],
  },
  {
    cityKey: 'Chennai',
    name: 'Fortis Malar Hospital',
    address: '52 1st Main Road, Gandhi Nagar, Adyar, Chennai - 600020',
    phone: '044-42892222',
    email: 'info@fortis-malar.com',
    specialties: ['Cardiology', 'Orthopedics', 'Urology', 'Psychiatry'],
    beds: { general: 60, icu: 15, emergency: 10 },
    departments: [
      { name: 'Cardiology',   specialty: 'Cardiology',  doctorName: 'Dr. Venkat P' },
      { name: 'Orthopaedics', specialty: 'Orthopedics', doctorName: 'Dr. Suresh L' },
      { name: 'Urology',      specialty: 'Urology',     doctorName: 'Dr. Hari K' },
      { name: 'Psychiatry',   specialty: 'Psychiatry',  doctorName: 'Dr. Nalini A' },
    ],
  },
  {
    cityKey: 'Coimbatore',
    name: 'PSG Hospitals',
    address: 'Peelamedu, Coimbatore - 641004',
    phone: '0422-4345678',
    email: 'info@psghospitals.com',
    specialties: ['General Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics'],
    beds: { general: 100, icu: 25, emergency: 20 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Siva R' },
      { name: 'Cardiology OPD',   specialty: 'Cardiology',       doctorName: 'Dr. Ravi K' },
      { name: 'Neurology OPD',    specialty: 'Neurology',        doctorName: 'Dr. Uma S' },
      { name: 'Paediatrics',      specialty: 'Pediatrics',       doctorName: 'Dr. Gowri M' },
    ],
  },
  {
    cityKey: 'Coimbatore',
    name: 'Kovai Medical Center',
    address: 'Avinashi Road, Coimbatore - 641014',
    phone: '0422-4323800',
    email: 'info@kmch.com',
    specialties: ['Oncology', 'Cardiology', 'Orthopedics', 'General Surgery', 'Dermatology'],
    beds: { general: 120, icu: 30, emergency: 25 },
    departments: [
      { name: 'Oncology OPD',    specialty: 'Oncology',        doctorName: 'Dr. Murugan A' },
      { name: 'Cardiology',      specialty: 'Cardiology',      doctorName: 'Dr. Pradeep V' },
      { name: 'General Surgery', specialty: 'General Surgery', doctorName: 'Dr. Senthil K' },
      { name: 'Dermatology',     specialty: 'Dermatology',     doctorName: 'Dr. Lakshmi N' },
    ],
  },
  {
    cityKey: 'Mumbai',
    name: 'Lilavati Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai - 400050',
    phone: '022-26751000',
    email: 'info@lilavatihospital.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Urology'],
    beds: { general: 150, icu: 35, emergency: 20 },
    departments: [
      { name: 'Cardiology OPD',  specialty: 'Cardiology',  doctorName: 'Dr. Ajay Shah' },
      { name: 'Neurology OPD',   specialty: 'Neurology',   doctorName: 'Dr. Nisha Mehta' },
      { name: 'Orthopaedics',    specialty: 'Orthopedics', doctorName: 'Dr. Rohit Joshi' },
      { name: 'Urology',         specialty: 'Urology',     doctorName: 'Dr. Vivek Patel' },
    ],
  },
  {
    cityKey: 'Mumbai',
    name: 'KEM Hospital',
    address: 'Acharya Donde Marg, Parel, Mumbai - 400012',
    phone: '022-24136051',
    email: 'info@kemhospital.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'General Surgery'],
    beds: { general: 300, icu: 60, emergency: 50 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Suresh Rane' },
      { name: 'Paediatrics',      specialty: 'Pediatrics',       doctorName: 'Dr. Anjali Desai' },
      { name: 'Gynaecology',      specialty: 'Gynecology',       doctorName: 'Dr. Sneha Patil' },
      { name: 'ENT',              specialty: 'ENT',              doctorName: 'Dr. Kiran More' },
    ],
  },
  {
    cityKey: 'Bangalore',
    name: 'Manipal Hospital',
    address: '98 HAL Airport Road, Bangalore - 560017',
    phone: '080-25023100',
    email: 'info@manipalhospitals.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics'],
    beds: { general: 130, icu: 30, emergency: 20 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Arun Kumar' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Kavya R' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Girish M' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',  doctorName: 'Dr. Suma N' },
    ],
  },
  {
    cityKey: 'Bangalore',
    name: 'Victoria Hospital',
    address: 'Fort Road, Krishnarajendra Road, Bangalore - 560002',
    phone: '080-26700100',
    email: 'info@victoriahospital.gov.in',
    specialties: ['General Medicine', 'General Surgery', 'ENT', 'Dermatology', 'Psychiatry'],
    beds: { general: 250, icu: 50, emergency: 40 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Prakash H' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Ravi T' },
      { name: 'ENT',              specialty: 'ENT',              doctorName: 'Dr. Anitha S' },
      { name: 'Psychiatry',       specialty: 'Psychiatry',       doctorName: 'Dr. Deepak V' },
    ],
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB\n');

  // Wipe existing data except superadmin
  await City.deleteMany({});
  await Hospital.deleteMany({});
  await Department.deleteMany({});
  await Queue.deleteMany({});
  await User.deleteMany({ role: { $in: ['hospital_admin', 'staff'] } });
  console.log('Cleared old seed data');

  // 1. Insert cities
  const cityDocs = await City.insertMany(CITIES);
  const cityMap = {};
  cityDocs.forEach(c => { cityMap[c.name] = c._id; });
  console.log(`✓ Created ${cityDocs.length} cities (${CITIES.filter(c => c.isLive).length} live, ${CITIES.filter(c => !c.isLive).length} coming soon)\n`);

  // 2. Create hospitals + departments + queues (NO admin users)
  for (const h of HOSPITALS) {
    const cityId = cityMap[h.cityKey];
    if (!cityId) { console.warn(`  ✗ City not found: ${h.cityKey}`); continue; }

    const hospital = await Hospital.create({
      name: h.name,
      cityId,
      address: h.address,
      phone: h.phone,
      email: h.email,
      specialties: h.specialties,
      isActive: true,
      beds: {
        general:   { total: h.beds.general,   occupied: 0, admissions: [] },
        icu:       { total: h.beds.icu,        occupied: 0, admissions: [] },
        emergency: { total: h.beds.emergency,  occupied: 0, admissions: [] },
      },
    });

    for (const d of h.departments) {
      const dept = await Department.create({
        hospitalId: hospital._id,
        name: d.name,
        specialty: d.specialty,
        doctorName: d.doctorName,
      });
      await Queue.create({
        hospitalId: hospital._id,
        deptId: dept._id,
        isOpen: true,
        currentToken: 0,
        totalWaiting: 0,
        counter: 0,
        estimatedWaitMinutes: 0,
      });
    }

    console.log(`  ✓ ${h.name} (${h.cityKey}) — ${h.departments.length} depts, no admin yet`);
  }

  console.log(`\n✅ Seed complete! ${HOSPITALS.length} hospitals created.`);
  console.log('\nNext step: Go to Admin > Hospitals and use "Add Admin" on each hospital to');
  console.log('create admin accounts — credentials will be emailed automatically.\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
