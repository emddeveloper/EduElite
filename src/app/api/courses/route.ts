import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Course } from '@/models/Course'

export async function GET() {
  try {
    const conn = await dbConnect()
    if (!conn) {
      return NextResponse.json({ error: 'Database not configured (MONGODB_URI missing)' }, { status: 500 })
    }
    const courses = await Course.find().populate('assignedTeacher').sort({ createdAt: -1 })
    return NextResponse.json({ data: courses })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch courses'
    console.error('[GET /api/courses] Error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const conn = await dbConnect()
    if (!conn) {
      return NextResponse.json({ error: 'Database not configured (MONGODB_URI missing)' }, { status: 500 })
    }

    const payload = {
      name: String(body.name || '').trim(),
      description: body.description ? String(body.description) : undefined,
      credits: Number.isFinite(Number(body.credits)) ? Number(body.credits) : 3,
      assignedTeacher: body.assignedTeacher ? String(body.assignedTeacher) : undefined,
    }

    if (!payload.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const created = await Course.create(payload)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create course'
    console.error('[POST /api/courses] Error:', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
