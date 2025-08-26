import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Attendance } from '@/models/Attendance'
import { Types } from 'mongoose'

function parseDate(v?: string | null) {
  if (!v) return undefined
  const d = new Date(v)
  return isNaN(d.getTime()) ? undefined : d
}

export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const course = searchParams.get('course')
    const student = searchParams.get('student')
    const date = searchParams.get('date')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const page = Number(searchParams.get('page') || 1)
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)))

    const filter: any = {}
    if (course && Types.ObjectId.isValid(course)) filter.course = new Types.ObjectId(course)
    if (student && Types.ObjectId.isValid(student)) filter.student = new Types.ObjectId(student)

    if (date) {
      const d = parseDate(date)
      if (d) {
        const start = new Date(d)
        start.setHours(0, 0, 0, 0)
        const end = new Date(d)
        end.setHours(23, 59, 59, 999)
        filter.date = { $gte: start, $lte: end }
      }
    } else {
      const fromD = parseDate(from)
      const toD = parseDate(to)
      if (fromD || toD) {
        filter.date = {}
        if (fromD) filter.date.$gte = fromD
        if (toD) filter.date.$lte = toD
      }
    }

    const skip = (page - 1) * pageSize
    const [items, total] = await Promise.all([
      Attendance.find(filter)
        .populate('student')
        .populate('course')
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize),
      Attendance.countDocuments(filter),
    ])

    return NextResponse.json({ data: items, total, page, pageSize })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch attendance'
    console.error('[GET /api/attendance] Error:', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// Bulk mark attendance for a course and date
// Body: { course: string, date: string|Date, entries: [{ student: string, status: 'present'|'absent'|'late'|'excused', remarks?: string }] }
export async function POST(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const courseId = String(body.course || '')
    const dateVal = parseDate(body.date)
    const entries: Array<{ student: string; status: string; remarks?: string }> = Array.isArray(body.entries)
      ? body.entries
      : []

    if (!Types.ObjectId.isValid(courseId)) return NextResponse.json({ error: 'Invalid course' }, { status: 400 })
    if (!dateVal) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

    const ops = entries
      .filter((e) => Types.ObjectId.isValid(e.student) && typeof e.status === 'string')
      .map((e) => ({
        updateOne: {
          filter: { student: new Types.ObjectId(e.student), course: new Types.ObjectId(courseId), date: dateVal },
          update: {
            $set: {
              status: e.status,
              remarks: e.remarks || undefined,
            },
          },
          upsert: true,
        },
      }))

    if (ops.length === 0) return NextResponse.json({ error: 'No valid entries' }, { status: 400 })

    const res = await Attendance.bulkWrite(ops, { ordered: false })
    return NextResponse.json({ result: res })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to mark attendance'
    console.error('[POST /api/attendance] Error:', err)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

// Update a single record
// Body: { id: string, status?: string, remarks?: string }
export async function PATCH(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json()
    const id = String(body.id || '')
    if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

    const update: any = {}
    if (body.status) update.status = body.status
    if (typeof body.remarks !== 'undefined') update.remarks = body.remarks || undefined

    const updated = await Attendance.findByIdAndUpdate(id, update, { new: true })
    return NextResponse.json({ data: updated })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update attendance'
    console.error('[PATCH /api/attendance] Error:', err)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

// Delete by id or by date+course
// Body: { id?: string, course?: string, date?: string }
export async function DELETE(req: NextRequest) {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

    const body = await req.json().catch(() => ({} as any))
    const id = body.id as string | undefined
    const course = body.course as string | undefined
    const date = parseDate(body.date)

    if (id) {
      if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
      await Attendance.findByIdAndDelete(id)
      return NextResponse.json({ ok: true })
    }

    if (course && date && Types.ObjectId.isValid(course)) {
      await Attendance.deleteMany({ course: new Types.ObjectId(course), date })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Specify id or (course & date)' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete attendance'
    console.error('[DELETE /api/attendance] Error:', err)
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
