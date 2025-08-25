import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import Student from '@/models/Student'

export async function GET() {
  try {
    await dbConnect()
    const students = await Student.find().sort({ createdAt: -1 })
    return NextResponse.json({ data: students })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    await dbConnect()
    const created = await Student.create(body)
    return NextResponse.json({ data: created }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create student' }, { status: 400 })
  }
}
