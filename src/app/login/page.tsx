"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Student", value: "student" },
];

export default function LoginPage() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("teacher");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      // we pass identifier, password; role is optional used by UI/redirects
      identifier,
      password,
      callbackUrl,
    });
    setLoading(false);
    if (res?.ok) {
      window.location.href = callbackUrl || "/";
    } else {
      setError(res?.error || "Login failed");
    }
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-md card p-6 space-y-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Sign in</h1>
          <p className="text-sm text-neutral-500">Welcome back to EduElite</p>
        </div>

        <div>
          <label className="text-sm text-neutral-600">Role</label>
          <select
            className="input mt-1 w-full"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-neutral-600">Username or Email</label>
          <input
            className="input mt-1 w-full"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="jane@school.edu"
            required
          />
        </div>

        <div>
          <label className="text-sm text-neutral-600">Password</label>
          <input
            type="password"
            className="input mt-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" className="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <a className="text-sm text-[--color-primary] hover:underline" href="#">Forgot password?</a>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
        )}

        <button disabled={loading} className="btn btn-primary w-full" type="submit">
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="text-xs text-neutral-500 text-center">
          By signing in you agree to our Terms and Privacy Policy.
        </div>
      </form>
    </div>
  );
}
