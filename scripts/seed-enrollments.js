/*
  Seed enrollments: enroll many students into available courses.
  Usage: npm run seed:enrollments
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed:enrollments] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB || undefined, bufferCommands: false });

  const studentSchema = new mongoose.Schema({ name: String, email: String });
  const courseSchema = new mongoose.Schema({ name: String });
  const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    active: { type: Boolean, default: true },
    enrolledAt: { type: Date, default: Date.now },
  });
  enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

  const Student = conn.models.Student || conn.model('Student', studentSchema);
  const Course = conn.models.Course || conn.model('Course', courseSchema);
  const Enrollment = conn.models.Enrollment || conn.model('Enrollment', enrollmentSchema);

  const students = await Student.find().limit(500);
  const courses = await Course.find().limit(50);
  if (students.length === 0 || courses.length === 0) {
    console.warn('[seed:enrollments] Need students and courses to seed enrollments.');
    await conn.disconnect();
    return;
  }

  function sample(arr, n) {
    const res = [];
    const taken = new Set();
    n = Math.min(n, arr.length);
    while (res.length < n) {
      const i = Math.floor(Math.random() * arr.length);
      if (!taken.has(i)) {
        taken.add(i);
        res.push(arr[i]);
      }
    }
    return res;
  }

  const ops = [];
  for (const course of courses) {
    const count = 15 + Math.floor(Math.random() * 16); // 15-30 students per course
    const picks = sample(students, count);
    for (const s of picks) {
      ops.push({
        updateOne: {
          filter: { course: course._id, student: s._id },
          update: { $set: { active: true, enrolledAt: new Date() } },
          upsert: true,
        },
      });
    }
  }

  console.log(`[seed:enrollments] Upserting ${ops.length} enrollments...`);
  if (ops.length) await Enrollment.bulkWrite(ops, { ordered: false }).catch((e) => console.warn('bulkWrite warn:', e?.message || e));

  console.log('[seed:enrollments] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
