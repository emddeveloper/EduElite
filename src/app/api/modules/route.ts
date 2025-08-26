import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import Module from '@/models/Module';

export async function GET() {
  await dbConnect();
  const modules = await Module.find({}).lean();
  return NextResponse.json(modules);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const body = await req.json();
  const { name, path, icon, description, isActive = true } = body || {};
  if (!name || !path) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const created = await Module.create({ name, path, icon, description, isActive });
  return NextResponse.json(created, { status: 201 });
}
