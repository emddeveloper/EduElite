/*
  Seed initial admin user and sample modules with full permissions.
  Usage: npm run seed:auth
*/

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('[seed-auth] MONGODB_URI missing in .env');
  process.exit(1);
}

async function main() {
  const conn = await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB || undefined,
    bufferCommands: false,
  });

  // Define minimal models inline to avoid TS import requirements
  const PermissionSchema = new mongoose.Schema({
    module: { type: String, required: true },
    canView: { type: Boolean, default: true },
    canEdit: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: true },
  }, { _id: false });

  const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
    isActive: { type: Boolean, default: true },
    permissions: { type: [PermissionSchema], default: [] },
    lastLogin: { type: Date },
  }, { timestamps: true });

  const ModuleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    path: { type: String, required: true, trim: true },
    icon: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const User = conn.models.User || conn.model('User', UserSchema);
  const Module = conn.models.Module || conn.model('Module', ModuleSchema);

  const modules = [
    { name: 'Dashboard', path: '/', icon: 'LuLayoutDashboard', description: 'Overview dashboard' },
    { name: 'Students', path: '/students', icon: 'LuUsers', description: 'Manage students' },
    { name: 'Teachers', path: '/teachers', icon: 'LuUserCog', description: 'Manage teachers' },
    { name: 'Courses', path: '/courses', icon: 'LuBookOpen', description: 'Manage courses' },
    { name: 'Attendance', path: '/attendance', icon: 'LuCheck', description: 'Track attendance' },
    { name: 'Grades', path: '/grades', icon: 'LuGraduationCap', description: 'Manage grades' },
    { name: 'Reports', path: '/reports', icon: 'LuFileBarChart', description: 'Generate reports' },
    { name: 'Settings', path: '/settings', icon: 'LuSettings', description: 'System settings' },
  ];

  console.log('[seed-auth] Upserting modules...');
  for (const m of modules) {
    await Module.updateOne({ name: m.name }, { $set: m }, { upsert: true });
  }

  const adminUsername = 'admin';
  const adminEmail = 'admin@eduelite.local';
  const adminPassword = 'Admin@123';

  console.log('[seed-auth] Ensuring admin user exists...');
  const existing = await User.findOne({ $or: [{ username: adminUsername }, { email: adminEmail }] });
  let userId;
  if (!existing) {
    const hash = await bcrypt.hash(adminPassword, 10);
    const created = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: hash,
      role: 'admin',
      isActive: true,
      permissions: [], // set below
    });
    userId = created._id;
    console.log('[seed-auth] Admin created:', adminEmail, '(password:', adminPassword, ')');
  } else {
    userId = existing._id;
    // Optionally sync password to known default on re-seed
    if (process.env.RESET_ADMIN_PASSWORD === 'true') {
      const hash = await bcrypt.hash(adminPassword, 10);
      await User.updateOne({ _id: userId }, { $set: { password: hash } });
      console.log('[seed-auth] Admin password reset to default.');
    }
  }

  console.log('[seed-auth] Granting admin full permissions on all modules...');
  const allPermissions = modules.map((m) => ({
    module: m.name.toLowerCase(),
    canView: true,
    canEdit: true,
    canDelete: true,
  }));
  await User.updateOne({ _id: userId }, { $set: { permissions: allPermissions, role: 'admin', isActive: true } });

  console.log('[seed-auth] Done.');
  await conn.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
