require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const City = require('./models/City');
const Hospital = require('./models/Hospital');
const Department = require('./models/Department');
const Queue = require('./models/Queue');
const User = require('./models/User');

// ─── Seed Data ───────────────────────────────────────────────────────────────

const CITIES = [
  { name: 'Chennai',       state: 'Tamil Nadu',       isLive: true },
  { name: 'Coimbatore',    state: 'Tamil Nadu',       isLive: true },
  { name: 'Mumbai',        state: 'Maharashtra',      isLive: true },
  { name: 'Bangalore',     state: 'Karnataka',        isLive: true },
  { name: 'Hyderabad',     state: 'Telangana',        isLive: true },
  { name: 'Delhi',         state: 'Delhi',            isLive: true },
  { name: 'Pune',          state: 'Maharashtra',      isLive: true },
  { name: 'Ahmedabad',     state: 'Gujarat',          isLive: true },
  { name: 'Jaipur',        state: 'Rajasthan',        isLive: true },
  { name: 'Lucknow',       state: 'Uttar Pradesh',    isLive: true },
  { name: 'Kolkata',       state: 'West Bengal',      isLive: true },
  { name: 'Kochi',         state: 'Kerala',           isLive: true },
  { name: 'Bhubaneswar',   state: 'Odisha',           isLive: true },
  { name: 'Chandigarh',    state: 'Punjab',           isLive: true },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh',   isLive: true },
  { name: 'Nagpur',        state: 'Maharashtra',      isLive: true },
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

  // ── Hyderabad ────────────────────────────────────────────────────────────────
  {
    cityKey: 'Hyderabad',
    name: 'Apollo Hospital Hyderabad',
    address: 'Jubilee Hills, Hyderabad - 500033',
    phone: '040-23607777',
    email: 'info@apollo-hyd.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Urology'],
    beds: { general: 120, icu: 30, emergency: 20 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Suresh Babu' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Rekha Rao' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Prasad K' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Kishore M' },
    ],
  },
  {
    cityKey: 'Hyderabad',
    name: 'Osmania General Hospital',
    address: 'Afzalgunj, Hyderabad - 500012',
    phone: '040-24600101',
    email: 'info@ogh.telangana.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'Dermatology'],
    beds: { general: 350, icu: 60, emergency: 50 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Ramaiah G' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Usha P' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Lalitha S' },
      { name: 'ENT OPD',          specialty: 'ENT',              doctorName: 'Dr. Srinivas T' },
    ],
  },

  // ── Delhi ────────────────────────────────────────────────────────────────────
  {
    cityKey: 'Delhi',
    name: 'AIIMS Delhi',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
    phone: '011-26588500',
    email: 'info@aiims.edu',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Pediatrics', 'Orthopedics'],
    beds: { general: 500, icu: 100, emergency: 80 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Naresh Trehan' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Padma Srivastava' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Vinod Raina' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',  doctorName: 'Dr. Rakesh Lodha' },
      { name: 'Emergency',        specialty: 'Emergency Medicine', doctorName: '' },
    ],
  },
  {
    cityKey: 'Delhi',
    name: 'Safdarjung Hospital',
    address: 'Ansari Nagar West, New Delhi - 110029',
    phone: '011-26730000',
    email: 'info@safdarjunghospital.in',
    specialties: ['General Medicine', 'General Surgery', 'Gynecology', 'ENT', 'Psychiatry'],
    beds: { general: 400, icu: 80, emergency: 60 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Anil Jain' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Manoj Sharma' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Sunita Gupta' },
      { name: 'Psychiatry OPD',   specialty: 'Psychiatry',       doctorName: 'Dr. Nimesh Desai' },
    ],
  },

  // ── Pune ─────────────────────────────────────────────────────────────────────
  {
    cityKey: 'Pune',
    name: 'Ruby Hall Clinic',
    address: '40 Sassoon Road, Pune - 411001',
    phone: '020-66455000',
    email: 'info@rubyhall.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Urology'],
    beds: { general: 140, icu: 32, emergency: 22 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Aashish Contractor' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Shrikant Kulkarni' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Parag Sancheti' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Rajendra Badwe' },
    ],
  },
  {
    cityKey: 'Pune',
    name: 'Sassoon General Hospital',
    address: 'Jai Prakash Narayan Road, Pune - 411001',
    phone: '020-26128000',
    email: 'info@sassoon.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'General Surgery', 'ENT'],
    beds: { general: 280, icu: 55, emergency: 45 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Ajay Chandanwale' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Pradeep Suryawanshi' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Rekha Daver' },
      { name: 'ENT OPD',          specialty: 'ENT',              doctorName: 'Dr. Milind Naik' },
    ],
  },

  // ── Ahmedabad ─────────────────────────────────────────────────────────────────
  {
    cityKey: 'Ahmedabad',
    name: 'Apollo Hospitals Ahmedabad',
    address: 'Plot 1A, Bhat GIDC, Gandhinagar Highway, Ahmedabad - 382428',
    phone: '079-66701800',
    email: 'info@apollo-ahmedabad.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Urology'],
    beds: { general: 110, icu: 28, emergency: 18 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Tejas Patel' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Bharat Shah' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Kalpesh Desai' },
      { name: 'Urology OPD',      specialty: 'Urology',     doctorName: 'Dr. Nikhil Modi' },
    ],
  },
  {
    cityKey: 'Ahmedabad',
    name: 'Civil Hospital Ahmedabad',
    address: 'Asarwa, Ahmedabad - 380016',
    phone: '079-22682801',
    email: 'info@civil.gujarat.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'General Surgery'],
    beds: { general: 400, icu: 80, emergency: 60 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Dhruv Vyas' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Meena Joshi' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Asha Trivedi' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Vijay Soni' },
    ],
  },

  // ── Jaipur ────────────────────────────────────────────────────────────────────
  {
    cityKey: 'Jaipur',
    name: 'Fortis Escorts Hospital Jaipur',
    address: 'Jawahar Lal Nehru Marg, Malviya Nagar, Jaipur - 302017',
    phone: '0141-2547000',
    email: 'info@fortis-jaipur.com',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Urology'],
    beds: { general: 100, icu: 25, emergency: 15 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Ashok Sharma' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Rajeev Gupta' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Sudhir Bhandari' },
      { name: 'Urology OPD',      specialty: 'Urology',     doctorName: 'Dr. Praveen Sharma' },
    ],
  },
  {
    cityKey: 'Jaipur',
    name: 'SMS Hospital Jaipur',
    address: 'Sawai Ram Singh Road, Jaipur - 302004',
    phone: '0141-2518888',
    email: 'info@smshospital.rajasthan.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'Dermatology'],
    beds: { general: 350, icu: 70, emergency: 55 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. C.L. Nawal' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Arun Singh' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Sunita Singhal' },
      { name: 'ENT OPD',          specialty: 'ENT',              doctorName: 'Dr. Rajesh Meena' },
    ],
  },

  // ── Lucknow ───────────────────────────────────────────────────────────────────
  {
    cityKey: 'Lucknow',
    name: 'Medanta - The Medicity Lucknow',
    address: 'Sector A, Pocket 1, Amar Shaheed Path, Lucknow - 226030',
    phone: '0522-4505050',
    email: 'info@medanta-lucknow.com',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Transplant'],
    beds: { general: 130, icu: 35, emergency: 25 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Viveka Kumar' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Rohit Bhatia' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Meenu Walia' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Ajay Chhabra' },
    ],
  },
  {
    cityKey: 'Lucknow',
    name: 'SGPGI Lucknow',
    address: 'Raebareli Road, Lucknow - 226014',
    phone: '0522-2668700',
    email: 'info@sgpgi.ac.in',
    specialties: ['General Medicine', 'Pediatrics', 'Nephrology', 'Gastroenterology', 'Neurology'],
    beds: { general: 400, icu: 90, emergency: 60 },
    departments: [
      { name: 'General Medicine',    specialty: 'General Medicine',   doctorName: 'Dr. R.K. Sharma' },
      { name: 'Nephrology OPD',      specialty: 'Nephrology',         doctorName: 'Dr. Narayan Prasad' },
      { name: 'Gastroenterology OPD',specialty: 'Gastroenterology',   doctorName: 'Dr. Uday Chand Ghoshal' },
      { name: 'Paediatrics OPD',     specialty: 'Pediatrics',         doctorName: 'Dr. Seema Kapoor' },
    ],
  },

  // ── Kolkata ───────────────────────────────────────────────────────────────────
  {
    cityKey: 'Kolkata',
    name: 'Apollo Gleneagles Hospital Kolkata',
    address: '58 Canal Circular Road, Kolkata - 700054',
    phone: '033-23203040',
    email: 'info@apollo-kolkata.com',
    specialties: ['Cardiology', 'Oncology', 'Neurology', 'Orthopedics', 'Urology'],
    beds: { general: 115, icu: 28, emergency: 18 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Devi Prasad Shetty' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Subhasis Mitra' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Alok Gupta' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Prasanta Kundu' },
    ],
  },
  {
    cityKey: 'Kolkata',
    name: 'Medical College Kolkata',
    address: '88 College Street, Kolkata - 700073',
    phone: '033-22123201',
    email: 'info@medicalcollegekolkata.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'General Surgery', 'Psychiatry'],
    beds: { general: 450, icu: 85, emergency: 65 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Santanu Sen' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Apurba Ghosh' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Sanjib Mukherjee' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Bijan Nath' },
    ],
  },

  // ── Kochi ─────────────────────────────────────────────────────────────────────
  {
    cityKey: 'Kochi',
    name: 'Amrita Institute of Medical Sciences',
    address: 'AIMS Ponekkara, Kochi - 682041',
    phone: '0484-2801234',
    email: 'info@aims.amrita.edu',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'Transplant'],
    beds: { general: 160, icu: 40, emergency: 30 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Yatin Mehta' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Girija A.S.' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Shaji Kumar' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Suresh Nair' },
    ],
  },
  {
    cityKey: 'Kochi',
    name: 'Government Medical College Ernakulam',
    address: 'Kalamassery, Ernakulam - 683503',
    phone: '0484-2411401',
    email: 'info@gmce.kerala.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'ENT', 'Dermatology'],
    beds: { general: 300, icu: 60, emergency: 50 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Rajan C.R.' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Anitha Mathew' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Usha Kumari' },
      { name: 'ENT OPD',          specialty: 'ENT',              doctorName: 'Dr. Binu P.S.' },
    ],
  },

  // ── Bhubaneswar ───────────────────────────────────────────────────────────────
  {
    cityKey: 'Bhubaneswar',
    name: 'AIIMS Bhubaneswar',
    address: 'Sijua, Patrapada, Bhubaneswar - 751019',
    phone: '0674-2476789',
    email: 'info@aiimsbhubaneswar.edu.in',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Orthopedics', 'General Medicine'],
    beds: { general: 200, icu: 45, emergency: 35 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',       doctorName: 'Dr. Prasant Mohapatra' },
      { name: 'Neurology OPD',    specialty: 'Neurology',        doctorName: 'Dr. Deepika Joshi' },
      { name: 'General Medicine', specialty: 'General Medicine',  doctorName: 'Dr. Asit Panda' },
      { name: 'Emergency',        specialty: 'Emergency Medicine',doctorName: '' },
    ],
  },
  {
    cityKey: 'Bhubaneswar',
    name: 'Sum Ultimate Medicare',
    address: 'K8, Kalinga Nagar, Bhubaneswar - 751003',
    phone: '0674-6660000',
    email: 'info@sumhospital.org',
    specialties: ['General Medicine', 'Pediatrics', 'Orthopedics', 'Gynecology', 'Urology'],
    beds: { general: 120, icu: 28, emergency: 18 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Sibasis Sahoo' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Sanjay Patnaik' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics',      doctorName: 'Dr. Rajen Dash' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Saswati Tripathy' },
    ],
  },

  // ── Chandigarh ────────────────────────────────────────────────────────────────
  {
    cityKey: 'Chandigarh',
    name: 'PGIMER Chandigarh',
    address: 'Sector 12, Chandigarh - 160012',
    phone: '0172-2756565',
    email: 'info@pgimer.edu.in',
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Nephrology', 'Gastroenterology'],
    beds: { general: 450, icu: 95, emergency: 70 },
    departments: [
      { name: 'Cardiology OPD',       specialty: 'Cardiology',       doctorName: 'Dr. Yash Paul Sharma' },
      { name: 'Neurology OPD',        specialty: 'Neurology',        doctorName: 'Dr. Vivek Lal' },
      { name: 'Nephrology OPD',       specialty: 'Nephrology',       doctorName: 'Dr. Harbir Singh Kohli' },
      { name: 'Gastroenterology OPD', specialty: 'Gastroenterology', doctorName: 'Dr. Rakesh Kochhar' },
    ],
  },
  {
    cityKey: 'Chandigarh',
    name: 'Government Medical College Chandigarh',
    address: 'Sector 32-B, Chandigarh - 160030',
    phone: '0172-2665253',
    email: 'info@gmch.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'General Surgery', 'Psychiatry'],
    beds: { general: 250, icu: 50, emergency: 40 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Ashok Kumar' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Meenu Singh' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Vanita Suri' },
      { name: 'Psychiatry OPD',   specialty: 'Psychiatry',       doctorName: 'Dr. Sandeep Grover' },
    ],
  },

  // ── Visakhapatnam ─────────────────────────────────────────────────────────────
  {
    cityKey: 'Visakhapatnam',
    name: 'Apollo Hospital Visakhapatnam',
    address: 'Waltair Main Road, Lucknow Colony, Visakhapatnam - 530002',
    phone: '0891-2872233',
    email: 'info@apollo-vizag.com',
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Urology'],
    beds: { general: 105, icu: 25, emergency: 15 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. D. Narasimha Rao' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Subbarao Battula' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Ramesh Babu' },
      { name: 'Oncology OPD',     specialty: 'Oncology',    doctorName: 'Dr. Srinivasa Rao' },
    ],
  },
  {
    cityKey: 'Visakhapatnam',
    name: 'King George Hospital',
    address: 'Maharanipeta, Visakhapatnam - 530002',
    phone: '0891-2564891',
    email: 'info@kgh.ap.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'General Surgery', 'ENT'],
    beds: { general: 350, icu: 70, emergency: 55 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. V.L.N. Murthy' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. K. Sudhakar' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Padmavathi' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Chandra Sekhar' },
    ],
  },

  // ── Nagpur ────────────────────────────────────────────────────────────────────
  {
    cityKey: 'Nagpur',
    name: 'Wockhardt Hospital Nagpur',
    address: 'Trikona Bagh, Ramdaspeth, Nagpur - 440012',
    phone: '0712-6634444',
    email: 'info@wockhardt-nagpur.com',
    specialties: ['Cardiology', 'Orthopedics', 'Neurology', 'Urology', 'Oncology'],
    beds: { general: 90, icu: 22, emergency: 14 },
    departments: [
      { name: 'Cardiology OPD',   specialty: 'Cardiology',  doctorName: 'Dr. Suresh Vyas' },
      { name: 'Orthopaedics OPD', specialty: 'Orthopedics', doctorName: 'Dr. Milind Kamble' },
      { name: 'Neurology OPD',    specialty: 'Neurology',   doctorName: 'Dr. Chandrashekhar Meshram' },
      { name: 'Urology OPD',      specialty: 'Urology',     doctorName: 'Dr. Prakash Mahajan' },
    ],
  },
  {
    cityKey: 'Nagpur',
    name: 'Government Medical College Nagpur',
    address: 'Medical Square, Hanuman Nagar, Nagpur - 440009',
    phone: '0712-2745328',
    email: 'info@gmcnagpur.gov.in',
    specialties: ['General Medicine', 'Pediatrics', 'Gynecology', 'General Surgery', 'Psychiatry'],
    beds: { general: 300, icu: 60, emergency: 48 },
    departments: [
      { name: 'General Medicine', specialty: 'General Medicine', doctorName: 'Dr. Suresh Wasnik' },
      { name: 'Paediatrics OPD',  specialty: 'Pediatrics',       doctorName: 'Dr. Amol Bhawane' },
      { name: 'Gynaecology OPD',  specialty: 'Gynecology',       doctorName: 'Dr. Sushma Dubey' },
      { name: 'General Surgery',  specialty: 'General Surgery',  doctorName: 'Dr. Rajesh Puri' },
    ],
  },
];

// ─── Seed credentials (printed at end) ───────────────────────────────────────

const SUPERADMIN = { name: 'Super Admin', email: 'superadmin@smartcare.com', password: 'SuperAdmin@123' };
const ADMIN_PASS  = 'HospAdmin@123';
const STAFF_PASS  = 'Staff@123';

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    family: 4,
  });
  console.log('Connected to MongoDB\n');

  // Wipe existing data (preserve existing superadmin if any)
  await City.deleteMany({});
  await Hospital.deleteMany({});
  await Department.deleteMany({});
  await Queue.deleteMany({});
  await User.deleteMany({ role: { $in: ['hospital_admin', 'staff'] } });
  console.log('Cleared old seed data');

  // 0. Superadmin
  const existingSA = await User.findOne({ role: 'superadmin' });
  if (!existingSA) {
    const hash = await bcrypt.hash(SUPERADMIN.password, 10);
    await User.create({ name: SUPERADMIN.name, email: SUPERADMIN.email, passwordHash: hash, role: 'superadmin', isFirstLogin: false });
    console.log(`✓ Superadmin created: ${SUPERADMIN.email}\n`);
  } else {
    console.log(`✓ Superadmin already exists: ${existingSA.email}\n`);
  }

  // 1. Insert cities
  const cityDocs = await City.insertMany(CITIES);
  const cityMap = {};
  cityDocs.forEach(c => { cityMap[c.name] = c._id; });
  console.log(`✓ Created ${cityDocs.length} cities (${CITIES.filter(c => c.isLive).length} live)\n`);

  const adminHash = await bcrypt.hash(ADMIN_PASS, 10);
  const staffHash = await bcrypt.hash(STAFF_PASS, 10);

  const createdAdmins = [];

  // 2. Create hospitals + departments + queues + admin + staff
  for (let i = 0; i < HOSPITALS.length; i++) {
    const h = HOSPITALS[i];
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

    // Departments + queues
    const deptDocs = [];
    for (const d of h.departments) {
      const dept = await Department.create({
        hospitalId: hospital._id,
        name: d.name,
        specialty: d.specialty,
        doctorName: d.doctorName,
      });
      deptDocs.push(dept);
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

    // Hospital admin — use index for guaranteed-unique email
    const adminEmail = `admin.h${i + 1}@smartcare.com`;
    const adminUser = await User.create({
      name: `${h.name} Admin`,
      email: adminEmail,
      passwordHash: adminHash,
      role: 'hospital_admin',
      hospitalId: hospital._id,
      isFirstLogin: false,
    });
    await Hospital.findByIdAndUpdate(hospital._id, { adminId: adminUser._id });
    createdAdmins.push({ hospital: h.name, email: adminEmail });

    // 2 staff members (one per first two departments)
    for (let s = 0; s < Math.min(2, deptDocs.length); s++) {
      const dept = deptDocs[s];
      const staffEmail = `staff.h${i + 1}.${s + 1}@smartcare.com`;
      const staffName  = dept.doctorName || `Staff ${i + 1}-${s + 1}`;
      await User.create({
        name: staffName,
        email: staffEmail,
        passwordHash: staffHash,
        role: 'staff',
        hospitalId: hospital._id,
        deptId: dept._id,
        isFirstLogin: false,
      });
    }

    console.log(`  ✓ ${h.name} (${h.cityKey}) — ${h.departments.length} depts · admin: ${adminEmail}`);
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   ${HOSPITALS.length} hospitals · ${HOSPITALS.length * 2} staff · ${HOSPITALS.length} hospital admins\n`);

  console.log('─── Login Credentials ───────────────────────────────────────');
  const saEmail = existingSA ? existingSA.email : SUPERADMIN.email;
  console.log(`  Superadmin  : ${saEmail} / ${existingSA ? '(existing password)' : SUPERADMIN.password}`);
  console.log(`  Hosp admins : see list below / password: ${ADMIN_PASS}`);
  console.log(`  Staff       : staff1a@smartcare.com … / password: ${STAFF_PASS}`);
  console.log('─────────────────────────────────────────────────────────────');
  createdAdmins.forEach(a => console.log(`  ${a.email.padEnd(45)} → ${a.hospital}`));
  console.log('─────────────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
