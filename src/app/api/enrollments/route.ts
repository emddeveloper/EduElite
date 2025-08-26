import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Enrollment } from '@/models/Enrollment'
import { Types } from 'mongoose'

// GET /api/enrollments?course=<id>
export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const course = searchParams.get('course')

    const filter: any = {}
    if (course && Types.ObjectId.isValid(course)) filter.course = new Types.ObjectId(course)
    filter.active = true

    const items = await Enrollment.find(filter).populate('student').populate('course').sort({ createdAt: -1 })
    return NextResponse.json({ data: items })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch enrollments'
    console.error('[GET /api/enrollments] Error:', e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/enrollments - add one or many students to a course
// body: { course: string, students: string[] }
export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const course = String(body.course || '')
    const students: string[] = Array.isArray(body.students) ? body.students : []
    if (!Types.ObjectId.isValid(course)) return NextResponse.json({ error: 'Invalid course' }, { status: 400 })

    const ops = students
      .filter((s) => Types.ObjectId.isValid(s))
      .map((s) => ({
        updateOne: {
          filter: { course: new Types.ObjectId(course), student: new Types.ObjectId(s) },
          update: { $set: { active: true, enrolledAt: new Date() } },
          upsert: true,
        },
      }))

    if (ops.length === 0) return NextResponse.json({ error: 'No valid students' }, { status: 400 })

    const res = await Enrollment.bulkWrite(ops, { ordered: false })
    return NextResponse.json({ result: res })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to add enrollments'
    console.error('[POST /api/enrollments] Error:', e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

// DELETE /api/enrollments - deactivate/removes
// body: { course: string, students: string[], hard?: boolean }
export async function DELETE(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const course = String(body.course || '')
    const students: string[] = Array.isArray(body.students) ? body.students : []
    const hard = !!body.hard

    if (!Types.ObjectId.isValid(course)) return NextResponse.json({ error: 'Invalid course' }, { status: 400 })
    const ids = students.filter((s) => Types.ObjectId.isValid(s)).map((s) => new Types.ObjectId(s))
    if (ids.length === 0) return NextResponse.json({ error: 'No valid students' }, { status: 400 })

    if (hard) {
      await Enrollment.deleteMany({ course: new Types.ObjectId(course), student: { $in: ids } })
    } else {
      await Enrollment.updateMany(
        { course: new Types.ObjectId(course), student: { $in: ids } },
        { $set: { active: false } }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to remove enrollments'
    console.error('[DELETE /api/enrollments] Error:', e)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
