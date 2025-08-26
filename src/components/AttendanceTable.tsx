"use client";

import React from "react";

type AttRow = {
  _id: string;
  date: string | Date;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
  student?: { _id: string; name?: string; email?: string } | string;
  course?: { _id: string; name?: string } | string;
};

type Props = {
  rows: AttRow[];
};

export default function AttendanceTable({ rows }: Props) {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<"All" | AttRow["status"]>("All");

  const filtered = React.useMemo(() => {
    let list = rows || [];
    if (status !== "All") list = list.filter((r) => r.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((r) => {
        const s = typeof r.student === "string" ? r.student : r.student?.name || r.student?.email || "";
        const c = typeof r.course === "string" ? r.course : r.course?.name || "";
        return s.toLowerCase().includes(q) || c.toLowerCase().includes(q);
      });
    }
    return list;
  }, [rows, query, status]);

  return (
    <div>
      <div className="flex items-center gap-2 p-3">
        <input className="input w-64" placeholder="Search student or course" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value as any)}>
          {(["All", "present", "absent", "late", "excused"] as const).map((s) => (
            <option key={s} value={s}>
              {s.toString()}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Course</th>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const date = new Date(r.date);
                const s = typeof r.student === "string" ? r.student : r.student?.name || r.student?.email || r.student?._id;
                const c = typeof r.course === "string" ? r.course : r.course?.name || r.course?._id;
                return (
                  <tr key={r._id}>
                    <td className="px-4 py-3">{date.toLocaleDateString()}</td>
                    <td className="px-4 py-3">{c}</td>
                    <td className="px-4 py-3">{s}</td>
                    <td className="px-4 py-3 capitalize">{r.status}</td>
                    <td className="px-4 py-3 max-w-[360px]">{r.remarks || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
