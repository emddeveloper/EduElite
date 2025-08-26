import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const body = await req.json();
  const { username, email, password, role, isActive, permissions } = body || {};
  const update: any = {};
  if (username !== undefined) update.username = username;
  if (email !== undefined) update.email = String(email).toLowerCase();
  if (role !== undefined) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  if (Array.isArray(permissions)) update.permissions = permissions;
  if (password) update.password = await bcrypt.hash(password, 10);
  const updated = await User.findByIdAndUpdate(params.id, update, { new: true }).select('-password').lean();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const res = await User.findByIdAndDelete(params.id).lean();
  if (!res) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
