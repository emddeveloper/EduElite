"use client";

import React from "react";

type StudentRow = {
  _id?: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate?: string | number | Date;
  parentContact?: string;
  photoUrl?: string;
  contactNo?: string;
  gender?: string;
  dob?: string | number | Date;
  nationality?: string;
  admissionNo?: string;
  rollNo?: string;
  bloodGroup?: string;
  category?: string;
  religion?: string;
  studentAddress?: string;
  addressSameAsStudent?: boolean;
  parent?: {
    name?: string;
    email?: string;
    mobile?: string;
    occupation?: string;
    address?: string;
  };
};

type Props = {
  students: StudentRow[];
};

export default function StudentTable({ students }: Props) {
  const [selected, setSelected] = React.useState<StudentRow | null>(null);
  const [query, setQuery] = React.useState("");
  const [grade, setGrade] = React.useState<string>("All");
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  const grades = React.useMemo(() => {
    const set = new Set<string>();
    students?.forEach((s) => s?.grade && set.add(s.grade));
    return ["All", ...Array.from(set).sort()];
  }, [students]);

  const filtered = React.useMemo(() => {
    let list = Array.isArray(students) ? students : [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((s) => `${s.name}`.toLowerCase().includes(q) || `${s.email}`.toLowerCase().includes(q));
    }
    if (grade !== "All") {
      list = list.filter((s) => s.grade === grade);
    }
    return list;
  }, [students, query, grade]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  React.useEffect(() => {
    // Reset/clamp page when filters or size change
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return (
    <>
      {/* Controls */}
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
            className="input w-40"
            value={grade}
            onChange={(e) => {
              setGrade(e.target.value);
              setPage(1);
            }}
          >
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
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
              <option key={n} value={n}>{n}</option>
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
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Grade</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Enrollment Date</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-600 dark:text-neutral-300">Parent Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">No students found.</td>
              </tr>
            ) : (
              pageItems.map((s) => (
                <tr
                  key={s._id}
                  className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/50 cursor-pointer"
                  onClick={() => setSelected(s)}
                  title="Click to view details"
                >
                  <td className="px-4 py-3 flex items-center gap-2">
                    {s.photoUrl ? (
                      <img src={s.photoUrl} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-xs font-medium">
                        {getInitials(s.name)}
                      </div>
                    )}
                    <span>{s.name}</span>
                  </td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.grade}</td>
                  <td className="px-4 py-3">{s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">{s.parentContact}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-3 py-2 text-sm text-neutral-600">
        <div>
          Showing {filtered.length === 0 ? 0 : start + 1}-{Math.min(start + pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            className="btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-lg shadow-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3">
                  {selected.photoUrl ? (
                    <img src={selected.photoUrl} alt={selected.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-semibold">
                      {getInitials(selected.name)}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold">{selected.name}</div>
                    <div className="text-xs text-neutral-500">{selected.email}</div>
                  </div>
                </div>
                <button className="btn btn-tertiary" onClick={() => setSelected(null)}>Close</button>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {/* Basic Info */}
                <Section title="Basic Info">
                  <Field label="Grade" value={selected.grade} />
                  <Field label="Enrollment" value={fmtDate(selected.enrollmentDate)} />
                  <Field label="Contact No" value={selected.contactNo} />
                  <Field label="Gender" value={selected.gender} />
                  <Field label="DOB" value={fmtDate(selected.dob)} />
                  <Field label="Nationality" value={selected.nationality} />
                </Section>

                {/* Student IDs */}
                <Section title="Identifiers">
                  <Field label="Admission No" value={selected.admissionNo} />
                  <Field label="Roll No" value={selected.rollNo} />
                  <Field label="Blood Group" value={selected.bloodGroup} />
                  <Field label="Category" value={selected.category} />
                  <Field label="Religion" value={selected.religion} />
                </Section>

                {/* Address */}
                <Section title="Address">
                  <Field label="Address" value={selected.studentAddress} long />
                  <Field label="Same as Parent?" value={boolText(selected.addressSameAsStudent)} />
                </Section>

                {/* Parent */}
                <Section title="Parent / Guardian">
                  <Field label="Name" value={selected.parent?.name} />
                  <Field label="Email" value={selected.parent?.email} />
                  <Field label="Mobile" value={selected.parent?.mobile} />
                  <Field label="Occupation" value={selected.parent?.occupation} />
                  <Field label="Address" value={selected.parent?.address} long />
                </Section>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button className="btn btn-tertiary" onClick={() => setSelected(null)}>Close</button>
                <a className="btn btn-primary" href={`mailto:${selected.email}`}>Email</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function fmtDate(d?: string | number | Date) {
  if (!d) return "-";
  try {
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString();
  } catch {
    return "-";
  }
}

function boolText(v?: boolean) {
  if (v === undefined || v === null) return "-";
  return v ? "Yes" : "No";
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-neutral-500 mb-2">{title}</div>
      <div className="grid grid-cols-1 gap-2">{children}</div>
    </div>
  );
}

function Field({ label, value, long }: { label: string; value?: React.ReactNode; long?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className={`mt-0.5 ${long ? "whitespace-pre-wrap" : "truncate"}`}>
        {value || "-"}
      </div>
    </div>
  );
}
