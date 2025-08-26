import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Teacher } from '@/models/Teacher'

export async function GET() {
  try {
    const conn = await dbConnect()
    if (!conn) {
      return NextResponse.json({ error: 'Database not configured (MONGODB_URI missing)' }, { status: 500 })
    }
    const teachers = await Teacher.find().sort({ createdAt: -1 })
    return NextResponse.json({ data: teachers })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch teachers'
    console.error('[GET /api/teachers] Error:', err)
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
      email: String(body.email || '').trim(),
      subjectSpecialty: String(body.subjectSpecialty || '').trim(),
      hireDate: body.hireDate ? new Date(body.hireDate) : new Date(),
    }

    if (!payload.name || !payload.email || !payload.subjectSpecialty) {
      return NextResponse.json({ error: 'name, email and subjectSpecialty are required' }, { status: 400 })
    }

    try {
      const created = await Teacher.create(payload)
      return NextResponse.json({ data: created }, { status: 201 })
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
        return NextResponse.json({ error: 'A teacher with this email already exists.' }, { status: 409 })
      }
      throw e
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create teacher'
    console.error('[POST /api/teachers] Error:', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
