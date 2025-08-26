/*
  Seed 50 dummy teachers.
  Usage: npm run seed:teachers
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed:teachers] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB || undefined,
    bufferCommands: false,
  });

  const teacherSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      subjectSpecialty: { type: String, required: true },
      hireDate: { type: Date, required: true },
    },
    { timestamps: true }
  );

  const Teacher = conn.models.Teacher || conn.model('Teacher', teacherSchema);

  // Dummy data helpers
  const firstNames = ['Amit','Rohit','Neha','Priya','Sunita','Rahul','Vikram','Pooja','Sanjay','Kiran','Anil','Rakesh','Smita','Deepa','Arun','Seema','Manish','Anita','Nitin','Meena'];
  const lastNames = ['Sharma','Gupta','Verma','Agarwal','Kumar','Reddy','Iyer','Khan','Patel','Das','Mukherjee','Joshi','Nair','Chopra','Mishra','Ghosh','Bose','Kaul','Gill','Shetty'];
  const subjects = ['Mathematics','Science','Physics','Chemistry','Biology','English','History','Geography','Computer Science','Economics','Hindi','Sanskrit','Civics','Art','Physical Education'];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randint(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function randomHireDate(startYear = 2010, endYear = new Date().getFullYear()) {
    const year = randint(startYear, endYear);
    const month = randint(0, 11);
    const day = randint(1, 28);
    return new Date(year, month, day);
  }

  const docs = [];
  for (let i = 0; i < 50; i++) {
    const fn = rand(firstNames);
    const ln = rand(lastNames);
    const name = `${fn} ${ln}`;
    const email = `${fn}.${ln}.${Date.now()}${i}@school.edu`.toLowerCase();
    const subjectSpecialty = rand(subjects);

    docs.push({
      name,
      email,
      subjectSpecialty,
      hireDate: randomHireDate(),
    });
  }

  console.log(`[seed:teachers] Inserting ${docs.length} teachers...`);
  try {
    await Teacher.insertMany(docs, { ordered: false });
  } catch (e) {
    // ignore duplicate errors when re-seeding
    if (e && e.writeErrors) {
      const dup = e.writeErrors.filter((w) => w.code === 11000).length;
      if (dup) console.warn(`[seed:teachers] Ignored ${dup} duplicate email(s)`);
    } else {
      console.warn('[seed:teachers] Some errors occurred:', e?.message || e);
    }
  }

  console.log('[seed:teachers] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
