"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  name: string;
  email: string;
  subjectSpecialty: string;
  hireDate: string; // yyyy-mm-dd
};

export default function NewTeacherPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    subjectSpecialty: "",
    hireDate: new Date().toISOString().slice(0, 10),
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.email || !form.subjectSpecialty) {
      setError("Please fill in Name, Email and Subject Specialty.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        subjectSpecialty: form.subjectSpecialty.trim(),
        hireDate: form.hireDate || new Date().toISOString(),
      };

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to create teacher (${res.status})`);
      }

      router.push("/teachers");
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
      name: "",
      email: "",
      subjectSpecialty: "",
      hireDate: new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Add Teacher</h1>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-neutral-700">Teacher Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Email</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Subject Specialty</label>
                <input className="input" value={form.subjectSpecialty} onChange={(e) => update("subjectSpecialty", e.target.value)} required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Hire Date</label>
                <input type="date" className="input" value={form.hireDate} onChange={(e) => update("hireDate", e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Teacher"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onReset} disabled={submitting}>
            Reset
          </button>
          <button type="button" className="btn btn-tertiary" onClick={() => router.push("/teachers")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
