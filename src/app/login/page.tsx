"use client";

import React, { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const roles = [
  { label: "Admin", value: "admin" },
  { label: "Teacher", value: "teacher" },
  { label: "Student", value: "student" },
];

function EduEliteLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      role="img"
      aria-label="EduElite Logo"
    >
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="32" fill="url(#g)" />
      <g transform="translate(128 92)" fill="#fff">
        <path d="M0-34L-70 0 0 34 70 0 0-34Z" />
        <path d="M-54 6v16c0 10 23 18 54 18s54-8 54-18V6L0 38-54 6Z" opacity="0.9" />
        <rect x="68" y="-2" width="8" height="40" rx="4" opacity="0.9" />
      </g>
    </svg>
  );
}

function LoginForm() {
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
    // Let NextAuth handle the redirect on the server for reliability in production (Vercel)
    const res = await signIn("credentials", {
      redirect: true,
      // we pass identifier, password; role is optional used by UI/redirects
      identifier,
      password,
      callbackUrl: callbackUrl || "/",
    });
    // If redirect is true, execution won't continue here on success.
    setLoading(false);
    if (res?.error) setError(res.error);
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Branding panel */}
        <div className="hidden lg:block">
          <div className="relative rounded-2xl p-8 bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 shadow-xl text-white overflow-hidden">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl opacity-40" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <EduEliteLogo size={80} />
                <div>
                  <div className="text-3xl font-extrabold tracking-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 via-sky-100 to-emerald-100">EduElite</span>
                  </div>
                  <div className="text-sm md:text-base font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 via-sky-100 to-emerald-100">School Management System</div>
                </div>
              </div>
              <p className="text-white text-lg md:text-xl leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
                Streamline attendance, courses, enrollment, and administration with a modern, secure platform.
              </p>
              <ul className="grid grid-cols-2 gap-3 text-base md:text-lg">
                <li className="flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-3 py-2 backdrop-blur-sm border border-white/20 text-white font-medium drop-shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  <span>RBAC-secured</span>
                </li>
                <li className="flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-3 py-2 backdrop-blur-sm border border-white/20 text-white font-medium drop-shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-300" />
                  <span>Attendance</span>
                </li>
                <li className="flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-3 py-2 backdrop-blur-sm border border-white/20 text-white font-medium drop-shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                  <span>Courses</span>
                </li>
                <li className="flex items-center gap-2 rounded-full bg-white/15 hover:bg-white/25 transition px-3 py-2 backdrop-blur-sm border border-white/20 text-white font-medium drop-shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-300" />
                  <span>Enrollments</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={onSubmit} className="w-full card p-6 md:p-8 space-y-4">
          <div className="text-center">
            <div className="mx-auto mb-2 w-14 h-14">
              <EduEliteLogo size={56} />
            </div>
            <h1 className="text-xl font-semibold">Sign in</h1>
            <p className="text-sm text-neutral-500">Welcome back to EduElite</p>
          </div>
          <div>
            <label className="text-sm text-neutral-600">Role</label>
            <select
              className="input mt-1 w-full"
              value={role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRole(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="checkbox"
              checked={remember}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemember(e.target.checked)}
            />
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100dvh-56px)] grid place-items-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
