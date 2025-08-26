"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female" | "Other" | "";
  nationality: string;
  contactNo: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  parentName: string;
  parentEmail: string;
  parentMobile: string;
  parentOccupation: string;
  parentAddress: string;
};

export default function NewStudentPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    nationality: "",
    contactNo: "",
    email: "",
    grade: "",
    enrollmentDate: new Date().toISOString().slice(0, 10),
    parentName: "",
    parentEmail: "",
    parentMobile: "",
    parentOccupation: "",
    parentAddress: "",
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // basic required validation
    if (!form.firstName || !form.lastName || !form.email || !form.grade) {
      setError("Please fill in First Name, Last Name, Email and Grade.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        grade: form.grade,
        enrollmentDate: form.enrollmentDate || new Date().toISOString(),
        parentContact: `${form.parentName}${form.parentMobile ? ` - ${form.parentMobile}` : ""}`.trim(),
        // Optionally include additional fields not in the schema if you plan to extend it later
        meta: {
          dob: form.dob,
          gender: form.gender,
          nationality: form.nationality,
          contactNo: form.contactNo,
          parent: {
            email: form.parentEmail,
            occupation: form.parentOccupation,
            address: form.parentAddress,
          },
        },
      };

      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to create student (${res.status})`);
      }

      router.push("/students");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setForm({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      nationality: "",
      contactNo: "",
      email: "",
      grade: "",
      enrollmentDate: new Date().toISOString().slice(0, 10),
      parentName: "",
      parentEmail: "",
      parentMobile: "",
      parentOccupation: "",
      parentAddress: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Add Student</h1>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Details */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-neutral-700">Student Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-neutral-600 mb-1">First Name</label>
                <input className="input" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Last Name</label>
                <input className="input" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Date of Birth</label>
                <input type="date" className="input" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Gender</label>
                <div className="flex items-center gap-4 py-2">
                  {(["Male", "Female", "Other"] as const).map((g) => (
                    <label key={g} className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="gender"
                        className="accent-primary"
                        checked={form.gender === g}
                        onChange={() => update("gender", g)}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Nationality</label>
                <input className="input" value={form.nationality} onChange={(e) => update("nationality", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Contact No</label>
                <input className="input" value={form.contactNo} onChange={(e) => update("contactNo", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Grade</label>
                <input className="input" value={form.grade} onChange={(e) => update("grade", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Joining Date</label>
                <input type="date" className="input" value={form.enrollmentDate} onChange={(e) => update("enrollmentDate", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Parent/Guardian Details */}
          <div className="space-y-4">
            <div className="text-sm font-semibold text-neutral-700">Parent / Guardian Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input className="input" value={form.parentName} onChange={(e) => update("parentName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Email</label>
                <input type="email" className="input" value={form.parentEmail} onChange={(e) => update("parentEmail", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Mobile Number</label>
                <input className="input" value={form.parentMobile} onChange={(e) => update("parentMobile", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Occupation</label>
                <input className="input" value={form.parentOccupation} onChange={(e) => update("parentOccupation", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Address</label>
                <textarea className="input min-h-[88px]" value={form.parentAddress} onChange={(e) => update("parentAddress", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Student"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onReset} disabled={submitting}>
            Reset
          </button>
          <button type="button" className="btn btn-tertiary" onClick={() => router.push("/students")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
