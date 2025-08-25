import Link from 'next/link'
import { headers } from 'next/headers'
import StudentTable from '@/components/StudentTable'

async function fetchStudents() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${proto}://${host}`

  const res = await fetch(`${base}/api/students`, { cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET /api/students failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  return json.data as any[]
}

export default async function StudentsPage() {
  let students: any[] = []
  let error: string | null = null
  try {
    students = await fetchStudents()
  } catch (e: any) {
    error = e?.message || 'Failed to load students'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Students</h1>
        <Link href="/students/new" className="btn btn-primary">Add Student</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>
        )}
        <StudentTable students={students} />
      </div>
    </div>
  )
}
