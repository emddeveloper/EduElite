import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/models/User';

// POST /api/users/permissions
// Body: { userId: string, permissions: [{ module, canView, canEdit, canDelete }] }
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session as any).user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const body = await req.json();
  const { userId, permissions } = body || {};
  if (!userId || !Array.isArray(permissions)) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { permissions } },
    { new: true }
  )
    .select('-password')
    .lean();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
