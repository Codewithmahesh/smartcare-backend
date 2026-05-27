require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);

  const hospitals = await Hospital.find({});
  if (hospitals.length === 0) {
    console.log('No hospitals found.');
    return;
  }

  for (const h of hospitals) {
    await Hospital.updateOne(
      { _id: h._id },
      {
        $set: {
          'beds.general.total': 10,
          'beds.general.occupied': 0,
          'beds.general.admissions': [],
          'beds.icu.total': 10,
          'beds.icu.occupied': 0,
          'beds.icu.admissions': [],
          'beds.emergency.total': 10,
          'beds.emergency.occupied': 0,
          'beds.emergency.admissions': [],
        },
      }
    );
    console.log(`Updated: ${h.name}`);
  }

  console.log('Done. All hospitals now have 10 beds per type, 0 occupied.');
  await mongoose.disconnect();
}

main().catch(console.error);
