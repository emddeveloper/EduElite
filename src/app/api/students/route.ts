import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Student } from '@/models/Student'

export async function GET() {
  try {
    const conn = await dbConnect()
    if (!conn) {
      return NextResponse.json({ error: 'Database not configured (MONGODB_URI missing)' }, { status: 500 })
    }
    const students = await Student.find().sort({ createdAt: -1 })
    return NextResponse.json({ data: students })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch students'
    console.error('[GET /api/students] Error:', err)
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
    // Coerce and map full form -> schema
    const payload = {
      // required core
      name: body.name,
      email: body.email,
      grade: body.grade,
      enrollmentDate: body.enrollmentDate ? new Date(body.enrollmentDate) : new Date(),
      parentContact: body.parentContact ?? body.parentMobile ?? body.contactNo ?? '',

      // extended fields
      firstName: body.firstName,
      lastName: body.lastName,
      dob: body.dob ? new Date(body.dob) : undefined,
      gender: body.gender,
      nationality: body.nationality,
      contactNo: body.contactNo,
      photoUrl: body.photoUrl,
      admissionNo: body.admissionNo,
      rollNo: body.rollNo,
      bloodGroup: body.bloodGroup,
      category: body.category,
      religion: body.religion,
      studentAddress: body.studentAddress,
      addressSameAsStudent: body.addressSameAsStudent,

      parent: {
        name: body.parentName,
        email: body.parentEmail,
        mobile: body.parentMobile,
        occupation: body.parentOccupation,
        address: body.parentAddress,
      },

      // retain meta if present for future flexibility
      ...('meta' in body ? { meta: body.meta } : {}),
    }

    if (!payload.name || !payload.email || !payload.grade) {
      return NextResponse.json({ error: 'name, email and grade are required' }, { status: 400 })
    }

    try {
      const created = await Student.create(payload)
      return NextResponse.json({ data: created }, { status: 201 })
    } catch (e: unknown) {
      // handle duplicate key error for unique email
      if (typeof e === 'object' && e !== null && 'code' in e && (e as { code?: number }).code === 11000) {
        return NextResponse.json({ error: 'A student with this email already exists.' }, { status: 409 })
      }
      throw e
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create student'
    console.error('[POST /api/students] Error:', err)
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

