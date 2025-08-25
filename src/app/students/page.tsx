import Link from 'next/link'

async function fetchStudents() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/students`, { cache: 'no-store' })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    const json = await res.json()
    return json.data as any[]
  } catch (e) {
    // When running locally without NEXT_PUBLIC_BASE_URL, fall back to relative fetch on the client
    // For server component, we retry with relative path using absolute URL not available.
    return []
  }
}

export default async function StudentsPage() {
  const students = await fetchStudents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Students</h1>
        <Link href="/students/new" className="btn btn-primary">Add Student</Link>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Name</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Email</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Grade</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Enrollment Date</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Parent Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">No students found.</td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50">
                    <td className="px-4 py-3">{s.name}</td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3">{s.grade}</td>
                    <td className="px-4 py-3">{new Date(s.enrollmentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{s.parentContact}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
