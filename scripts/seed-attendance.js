/*
  Seed attendance records for recent 10 days for each course enrollment.
  Usage: npm run seed:attendance
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed:attendance] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB || undefined, bufferCommands: false });

  const attendanceSchema = new mongoose.Schema(
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
      date: { type: Date, required: true },
      status: { type: String, enum: ['present', 'absent', 'late', 'excused'], required: true },
      remarks: String,
    },
    { timestamps: true }
  );
  attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

  const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    active: { type: Boolean, default: true },
  });

  const Enrollment = conn.models.Enrollment || conn.model('Enrollment', enrollmentSchema);
  const Attendance = conn.models.Attendance || conn.model('Attendance', attendanceSchema);

  const enrollments = await Enrollment.find({ active: true }).limit(2000);
  if (enrollments.length === 0) {
    console.warn('[seed:attendance] No active enrollments found, seed enrollments first.');
    await conn.disconnect();
    return;
  }

  function randomStatus() {
    const r = Math.random();
    if (r < 0.75) return 'present';
    if (r < 0.85) return 'late';
    if (r < 0.95) return 'excused';
    return 'absent';
  }

  const days = 10;
  const today = new Date();
  const ops = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - d);

    for (const en of enrollments) {
      const status = randomStatus();
      const remarks = status === 'late' ? 'Came late' : status === 'excused' ? 'Medical leave' : undefined;
      ops.push({
        updateOne: {
          filter: { student: en.student, course: en.course, date },
          update: { $set: { status, remarks } },
          upsert: true,
        },
      });
    }
  }

  console.log(`[seed:attendance] Upserting ${ops.length} records...`);
  if (ops.length) await Attendance.bulkWrite(ops, { ordered: false }).catch((e) => console.warn('bulkWrite warn:', e?.message || e));

  console.log('[seed:attendance] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
