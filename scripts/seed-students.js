/*
  Seed 100 dummy students.
  Usage: npm run seed:students
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB || undefined,
    bufferCommands: false,
  });

  const parentSchema = new mongoose.Schema(
    {
      name: String,
      email: String,
      mobile: String,
      occupation: String,
      address: String,
    },
    { _id: false }
  );

  const studentSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      grade: { type: String, required: true },
      enrollmentDate: { type: Date, required: true },
      parentContact: { type: String, required: true },

      firstName: String,
      lastName: String,
      dob: Date,
      gender: String,
      nationality: String,
      contactNo: String,
      photoUrl: String,
      admissionNo: String,
      rollNo: String,
      bloodGroup: String,
      category: String,
      religion: String,
      studentAddress: String,
      addressSameAsStudent: { type: Boolean, default: false },
      parent: { type: parentSchema },
      meta: mongoose.Schema.Types.Mixed,
    },
    { timestamps: true }
  );

  const Student = conn.models.Student || conn.model('Student', studentSchema);

  // Dummy data helpers
  const firstNames = ['Aarav','Vivaan','Aditya','Vihaan','Arjun','Sai','Reyansh','Muhammad','Krishna','Ibrahim','Aanya','Ananya','Diya','Isha','Kiara','Meera','Navya','Sara','Zara','Aisha'];
  const lastNames = ['Sharma','Verma','Gupta','Mehta','Kapoor','Khan','Singh','Iyer','Das','Reddy','Nair','Chopra','Patel','Joshi','Shetty','Bose','Kaul','Chawla','Gill','Mishra'];
  const genders = ['Male','Female','Other'];
  const bloodGroups = ['A+','A-','B+','B-','O+','O-','AB+','AB-'];
  const categories = ['General','OBC','SC','ST','EWS'];
  const religions = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Other'];
  const occupations = ['Engineer','Teacher','Doctor','Business','Government','Farmer','Lawyer','Accountant'];
  const nationalities = ['Indian'];
  const streets = ['MG Road','Brigade Road','Park Street','Linking Road','FC Road','Anna Salai','JM Road','Rajpath','Marine Drive'];

  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`); // Grade 1..12

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randint(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function randomDate(startYear = 2004, endYear = 2019) {
    const year = randint(startYear, endYear);
    const month = randint(0, 11);
    const day = randint(1, 28);
    return new Date(year, month, day);
  }

  const docs = [];
  for (let i = 0; i < 100; i++) {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const name = `${fn} ${ln}`;
    const grade = rand(grades);
    const email = `${fn}.${ln}.${Date.now()}${i}@example.com`.toLowerCase();
    const contactNo = `+91${randint(6000000000, 9999999999)}`;
    const parentName = `${rand(firstNames)} ${rand(lastNames)}`;
    const parentEmail = `${parentName.replace(/\s+/g,'_').toLowerCase()}@mail.com`;
    const parentMobile = `+91${randint(6000000000, 9999999999)}`;

    const doc = {
      name,
      email,
      grade,
      enrollmentDate: new Date(),
      parentContact: `${parentName} - ${parentMobile}`,

      firstName: fn,
      lastName: ln,
      dob: randomDate(2006, 2018),
      gender: rand(genders),
      nationality: rand(nationalities),
      contactNo,
      photoUrl: '',
      admissionNo: `ADM${String(1000 + i)}`,
      rollNo: String(1 + (i % 40)),
      bloodGroup: rand(bloodGroups),
      category: rand(categories),
      religion: rand(religions),
      studentAddress: `${randint(1, 200)}, ${rand(streets)}, ${rand(['Mumbai','Delhi','Bengaluru','Chennai','Pune','Kolkata'])}`,
      addressSameAsStudent: true,
      parent: {
        name: parentName,
        email: parentEmail,
        mobile: parentMobile,
        occupation: rand(occupations),
        address: `${randint(1, 200)}, ${rand(streets)}`,
      },
      meta: {
        source: 'seed',
        batch: Date.now(),
      },
    };

    docs.push(doc);
  }

  console.log(`[seed] Inserting ${docs.length} students...`);
  try {
    await Student.insertMany(docs, { ordered: false });
  } catch (e) {
    // ignore duplicate errors when re-seeding
    if (e && e.writeErrors) {
      const dup = e.writeErrors.filter((w) => w.code === 11000).length;
      if (dup) console.warn(`[seed] Ignored ${dup} duplicate email(s)`);
    } else {
      console.warn('[seed] Some errors occurred:', e?.message || e);
    }
  }

  console.log('[seed] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
