import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import { Student } from '@/models/Student'
import { Teacher } from '@/models/Teacher'
import { Course } from '@/models/Course'
import { Enrollment } from '@/models/Enrollment'
import { Attendance } from '@/models/Attendance'

// Always serve fresh data for dashboard
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const conn = await dbConnect()
    if (!conn) return NextResponse.json({ error: 'DB not configured' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })

    // Counts
    const [studentsCount, teachersCount, coursesCount, enrollmentsCount, attendanceCount] = await Promise.all([
      Student.countDocuments({}),
      Teacher.countDocuments({}),
      Course.countDocuments({}),
      Enrollment.countDocuments({ active: true }),
      Attendance.countDocuments({}),
    ])

    // Attendance summary for last 7 days
    const now = new Date()
    const start7 = new Date(now)
    start7.setHours(0, 0, 0, 0)
    start7.setDate(start7.getDate() - 6) // include today -> 7 days

    const attSummary = await Attendance.aggregate([
      { $match: { date: { $gte: start7 } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
          total: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: '$_id', present: 1, absent: 1, late: 1, excused: 1, total: 1, ratePresent: { $cond: [{ $gt: ['$total', 0] }, { $divide: ['$present', '$total'] }, 0] } } },
      { $sort: { date: 1 } },
    ])

    // Ensure all days present in summary
    const summaryByDate = new Map<string, any>(attSummary.map((r: any) => [r.date, r]))
    const days: any[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(start7)
      d.setDate(start7.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      if (summaryByDate.has(key)) days.push(summaryByDate.get(key))
      else days.push({ date: key, present: 0, absent: 0, late: 0, excused: 0, total: 0, ratePresent: 0 })
    }

    // Top courses by active enrollment
    const topCourses = await Enrollment.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$course', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: '$course' },
      { $project: { _id: 0, courseId: '$course._id', name: '$course.name', count: 1 } },
    ])

    // Teacher course counts
    const teacherCourseCounts = await Course.aggregate([
      { $match: { assignedTeacher: { $ne: null } } },
      { $group: { _id: '$assignedTeacher', courseCount: { $sum: 1 } } },
      {
        $lookup: {
          from: 'teachers',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher',
        },
      },
      { $unwind: '$teacher' },
      { $project: { _id: 0, teacherId: '$teacher._id', name: '$teacher.name', email: '$teacher.email', courseCount: 1 } },
      { $sort: { courseCount: -1 } },
      { $limit: 5 },
    ])

    // Recent items
    const [recentStudents, recentTeachers, recentCourses, recentAttendance] = await Promise.all([
      Student.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Teacher.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Course.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      Attendance.find({}).populate('student').populate('course').sort({ createdAt: -1 }).limit(10).lean(),
    ])

    return NextResponse.json({
      counts: {
        students: studentsCount,
        teachers: teachersCount,
        courses: coursesCount,
        enrollmentsActive: enrollmentsCount,
        attendanceRecords: attendanceCount,
      },
      attendanceLast7Days: days,
      topCoursesByEnrollment: topCourses,
      teacherCourseCounts,
      recent: {
        students: recentStudents,
        teachers: recentTeachers,
        courses: recentCourses,
        attendance: recentAttendance,
      },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to load dashboard'
    console.error('[GET /api/dashboard] Error:', err)
    return NextResponse.json({ error: msg }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
