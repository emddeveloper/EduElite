import Link from 'next/link'
import { headers } from 'next/headers'
import TeacherTable, { TeacherRow } from '@/components/TeacherTable'

async function fetchTeachers() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${proto}://${host}`

  const res = await fetch(`${base}/api/teachers`, { cache: 'no-store' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`GET /api/teachers failed: ${res.status} ${text}`)
  }
  const json = await res.json()
  return json.data as TeacherRow[]
}

export default async function TeachersPage() {
  let teachers: TeacherRow[] = []
  let error: string | null = null
  try {
    teachers = await fetchTeachers()
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load teachers'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Teachers</h1>
        <Link href="/teachers/new" className="btn btn-primary">Add Teacher</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>
        )}
        <TeacherTable teachers={teachers} />
      </div>
    </div>
  )
}
