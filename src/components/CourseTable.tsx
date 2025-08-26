"use client";

import React from "react";

export type CourseRow = {
  _id?: string;
  name: string;
  description?: string;
  credits: number;
  assignedTeacher?: { _id?: string; name?: string; email?: string } | string;
};

type Props = {
  courses: CourseRow[];
};

export default function CourseTable({ courses }: Props) {
  const [query, setQuery] = React.useState("");
  const [minCredits, setMinCredits] = React.useState<number | "All">("All");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const filtered = React.useMemo(() => {
    let list = Array.isArray(courses) ? courses : [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) => `${c.name}`.toLowerCase().includes(q) || `${c.description || ""}`.toLowerCase().includes(q)
      );
    }
    if (minCredits !== "All") {
      list = list.filter((c) => (Number(c.credits) || 0) >= Number(minCredits));
    }
    return list;
  }, [courses, query, minCredits]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  function teacherDisplay(t?: CourseRow["assignedTeacher"]) {
    if (!t) return "-";
    if (typeof t === "string") return t;
    return t.name || t.email || t._id || "-";
    }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3">
        <div className="flex gap-2 items-center">
          <input
            className="input w-64"
            placeholder="Search name or description..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="input w-40"
            value={minCredits === "All" ? "All" : String(minCredits)}
            onChange={(e) => {
              const v = e.target.value === "All" ? "All" : Number(e.target.value);
              setMinCredits(v);
              setPage(1);
            }}
          >
            {(["All", 2, 3, 4, 5] as const).map((n) => (
              <option key={String(n)} value={String(n)}>
                Min Credits: {String(n)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 items-center text-sm">
          <span className="text-neutral-500">Rows per page</span>
          <select
            className="input w-24"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
          <thead className="bg-neutral-50 dark:bg-neutral-900/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Name</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Credits</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Assigned Teacher</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No courses found.
                </td>
              </tr>
            ) : (
              pageItems.map((c) => (
                <tr key={c._id || `${c.name}-${c.credits}`}>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3">{c.credits}</td>
                  <td className="px-4 py-3">{teacherDisplay(c.assignedTeacher)}</td>
                  <td className="px-4 py-3 max-w-[480px]">{c.description || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-3 py-2 text-sm text-neutral-600">
        <div>
          Showing {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}
