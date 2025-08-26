"use client";

import React from "react";
import { useRouter } from "next/navigation";

type Course = { _id: string; name: string };
type Enroll = { _id: string; student: { _id: string; name?: string; email?: string } };

type Entry = { student: string; status: "present" | "absent" | "late" | "excused"; remarks?: string };

export default function MarkAttendancePage() {
  const router = useRouter();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [course, setCourse] = React.useState<string>("");
  const [date, setDate] = React.useState<string>(new Date().toISOString().slice(0, 10));
  const [enrollments, setEnrollments] = React.useState<Enroll[]>([]);
  const [entries, setEntries] = React.useState<Record<string, Entry>>({});
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let abort = false;
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" });
        const j = await res.json();
        if (!abort) setCourses((j.data || []).map((c: any) => ({ _id: String(c._id), name: String(c.name) })));
      } catch {
        if (!abort) setCourses([]);
      }
    }
    loadCourses();
    return () => {
      abort = true;
    };
  }, []);

  async function loadEnrollments(courseId: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/enrollments?course=${courseId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load enrollments (${res.status})`);
      const j = await res.json();
      const list: Enroll[] = (j.data || []).map((e: any) => ({ _id: String(e._id), student: { _id: String(e.student?._id), name: e.student?.name, email: e.student?.email } }));
      setEnrollments(list);
      // Initialize entries default present
      const defaults: Record<string, Entry> = {};
      list.forEach((e) => {
        defaults[e.student._id] = { student: e.student._id, status: "present" };
      });
      setEntries(defaults);
    } catch (e: any) {
      setError(e?.message || "Failed to load enrollments");
      setEnrollments([]);
      setEntries({});
    } finally {
      setLoading(false);
    }
  }

  function setEntry(studentId: string, upd: Partial<Entry>) {
    setEntries((prev) => ({ ...prev, [studentId]: { ...(prev[studentId] || { student: studentId, status: "present" }), ...upd } }));
  }

  async function submit() {
    if (!course) {
      setError("Select a course");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        course,
        date,
        entries: Object.values(entries),
      };
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to save attendance (${res.status})`);
      }
      router.push("/attendance");
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mark Attendance</h1>
      </div>

      <div className="card p-4 space-y-4">
        {error && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Course</label>
            <select
              className="input w-full"
              value={course}
              onChange={(e) => {
                const v = e.target.value;
                setCourse(v);
                if (v) loadEnrollments(v);
                else {
                  setEnrollments([]);
                  setEntries({});
                }
              }}
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-600 mb-1">Date</label>
            <input type="date" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                    Loading students...
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-neutral-500">
                    {course ? 'No enrollments found for this course.' : 'Select a course to view students.'}
                  </td>
                </tr>
              ) : (
                enrollments.map((en) => {
                  const sid = en.student._id;
                  const ent = entries[sid] || { student: sid, status: "present" };
                  return (
                    <tr key={sid}>
                      <td className="px-4 py-3">{en.student.name || en.student.email || sid}</td>
                      <td className="px-4 py-3">
                        <select
                          className="input w-40"
                          value={ent.status}
                          onChange={(e) => setEntry(sid, { status: e.target.value as Entry["status"] })}
                        >
                          {(["present", "absent", "late", "excused"] as const).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          className="input w-full"
                          placeholder="Remarks (optional)"
                          value={ent.remarks || ""}
                          onChange={(e) => setEntry(sid, { remarks: e.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button className="btn btn-primary" onClick={submit} disabled={saving || !course || enrollments.length === 0}>
            {saving ? "Saving..." : "Save Attendance"}
          </button>
          <button className="btn btn-tertiary" onClick={() => router.push("/attendance")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
