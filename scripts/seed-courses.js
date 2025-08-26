/*
  Seed 20 dummy courses.
  Usage: npm run seed:courses
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed:courses] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB || undefined,
    bufferCommands: false,
  });

  const courseSchema = new mongoose.Schema(
    {
      name: { type: String, required: true },
      description: { type: String },
      credits: { type: Number, default: 3 },
      assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    },
    { timestamps: true }
  );

  const teacherSchema = new mongoose.Schema({
    name: String,
    email: String,
    subjectSpecialty: String,
    hireDate: Date,
  });

  const Course = conn.models.Course || conn.model('Course', courseSchema);
  const Teacher = conn.models.Teacher || conn.model('Teacher', teacherSchema);

  const subjects = ['Mathematics','Science','Physics','Chemistry','Biology','English','History','Geography','Computer Science','Economics'];

  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // Fetch teachers to assign optionally
  const teacherDocs = await Teacher.find().limit(50);
  const teacherIds = teacherDocs.map((t) => t._id);

  const courses = [];
  for (let i = 1; i <= 20; i++) {
    const subject = rand(subjects);
    const name = `${subject} ${i}`;
    const credits = 2 + (i % 4); // 2..5
    const assignedTeacher = teacherIds.length > 0 && Math.random() > 0.4 ? rand(teacherIds) : undefined;

    courses.push({
      name,
      description: `An engaging course covering fundamentals of ${subject}.`,
      credits,
      assignedTeacher,
    });
  }

  console.log(`[seed:courses] Inserting ${courses.length} courses...`);
  try {
    await Course.insertMany(courses, { ordered: false });
  } catch (e) {
    console.warn('[seed:courses] Some errors may have occurred:', e?.message || e);
  }

  console.log('[seed:courses] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
