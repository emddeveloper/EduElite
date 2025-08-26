import Link from 'next/link'
import { headers } from 'next/headers'
import CourseTable, { CourseRow } from '@/components/CourseTable'

async function fetchCourses() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${proto}://${host}`

  const res = await fetch(`${base}/api/courses`, { cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET /api/courses failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  return json.data as CourseRow[]
}

export default async function CoursesPage() {
  let courses: CourseRow[] = []
  let error: string | null = null
  try {
    courses = await fetchCourses()
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load courses'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Courses</h1>
        <Link href="/courses/new" className="btn btn-primary">Add Course</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>
        )}
        <CourseTable courses={courses} />
      </div>
    </div>
  )
}
