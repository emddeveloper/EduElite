"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TeacherOption = { _id: string; name: string; email?: string };

type FormState = {
  name: string;
  description: string;
  credits: number;
  assignedTeacher?: string;
};

export default function NewCoursePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    credits: 3,
    assignedTeacher: undefined,
  });

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoadingTeachers(true);
      try {
        const res = await fetch("/api/teachers", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load teachers (${res.status})`);
        const j = await res.json();
        if (!abort) {
          const list: unknown = j.data || [];
          if (Array.isArray(list)) {
            setTeachers(
              list.map((t: Record<string, unknown>) => ({
                _id: String((t._id as string | number) ?? ""),
                name: String(((t.name as string | undefined) ?? "")),
                email: t.email as string | undefined,
              }))
            );
          } else {
            setTeachers([]);
          }
        }
      } catch {
        // silent fail; assigning teacher is optional
        if (!abort) setTeachers([]);
      } finally {
        if (!abort) setLoadingTeachers(false);
      }
    }
    load();
    return () => {
      abort = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name) {
      setError("Please fill in Course Name.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        credits: Number(form.credits) || 3,
        assignedTeacher: form.assignedTeacher || undefined,
      };

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Failed to create course (${res.status})`);
      }

      router.push("/courses");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function onReset() {
    setForm({ name: "", description: "", credits: 3, assignedTeacher: undefined });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Add Course</h1>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-sm font-semibold text-neutral-700">Course Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Name</label>
                <input className="input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Credits</label>
                <input
                  type="number"
                  className="input"
                  min={1}
                  max={10}
                  value={form.credits}
                  onChange={(e) => update("credits", Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-600 mb-1">Assigned Teacher (optional)</label>
                <select
                  className="input"
                  value={form.assignedTeacher || ""}
                  onChange={(e) => update("assignedTeacher", e.target.value || undefined)}
                  disabled={loadingTeachers}
                >
                  <option value="">-- Unassigned --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-neutral-600 mb-1">Description</label>
                <textarea
                  className="input min-h-[88px]"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Course"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onReset} disabled={submitting}>
            Reset
          </button>
          <button type="button" className="btn btn-tertiary" onClick={() => router.push("/courses")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
