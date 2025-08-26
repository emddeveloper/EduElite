"use client";

import React from "react";

export type TeacherRow = {
  _id?: string;
  name: string;
  email: string;
  subjectSpecialty: string;
  hireDate?: string | number | Date;
};

type Props = {
  teachers: TeacherRow[];
};

export default function TeacherTable({ teachers }: Props) {
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState<string>("All");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    teachers?.forEach((t) => t?.subjectSpecialty && set.add(t.subjectSpecialty));
    return ["All", ...Array.from(set).sort()];
  }, [teachers]);

  const filtered = React.useMemo(() => {
    let list = Array.isArray(teachers) ? teachers : [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (t) => `${t.name}`.toLowerCase().includes(q) || `${t.email}`.toLowerCase().includes(q)
      );
    }
    if (subject !== "All") {
      list = list.filter((t) => t.subjectSpecialty === subject);
    }
    return list;
  }, [teachers, query, subject]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3">
        <div className="flex gap-2 items-center">
          <input
            className="input w-64"
            placeholder="Search name or email..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="input w-48"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setPage(1);
            }}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
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
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Email</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Subject</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Hire Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  No teachers found.
                </td>
              </tr>
            ) : (
              pageItems.map((t) => (
                <tr key={t._id || `${t.email}`}>
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3">{t.email}</td>
                  <td className="px-4 py-3">{t.subjectSpecialty}</td>
                  <td className="px-4 py-3">{t.hireDate ? new Date(t.hireDate).toLocaleDateString() : "-"}</td>
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
