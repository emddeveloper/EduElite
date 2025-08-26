import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const users = await User.find().select('-password').lean();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const body = await req.json();
  const { username, email, password, role, isActive = true, permissions = [] } = body || {};
  if (!username || !email || !password || !role) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const hash = await bcrypt.hash(password, 10);
  const created = await User.create({ username, email: String(email).toLowerCase(), password: hash, role, isActive, permissions });
  const safe = created.toObject();
  delete (safe as any).password;
  return NextResponse.json(safe, { status: 201 });
}
