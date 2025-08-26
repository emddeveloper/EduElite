import AttendanceTable from '@/components/AttendanceTable'
import { headers } from 'next/headers'

async function fetchAttendance() {
  const h = await headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host = h.get('host') ?? 'localhost:3000'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/attendance?pageSize=100`, { cache: 'no-store' })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`GET /api/attendance failed: ${res.status} ${t}`)
  }
  const j = await res.json()
  return j.data as any[]
}

export default async function AttendanceListPage() {
  let rows: any[] = []
  let error: string | null = null
  try {
    rows = await fetchAttendance()
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Failed to load attendance'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Attendance</h1>
      </div>

      <div className="card p-0 overflow-hidden">
        {error && <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-200">{error}</div>}
        <AttendanceTable rows={rows} />
      </div>
    </div>
  )
}
