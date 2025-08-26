"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LuSchool,
  LuLayoutDashboard,
  LuUsers,
  LuUserCog,
  LuBookOpen,
  LuCheck,
  LuGraduationCap,
  LuX,
} from "react-icons/lu";

const nav = [
  { href: "/", label: "Dashboard", icon: LuLayoutDashboard },
  { href: "/students", label: "Students", icon: LuUsers },
  { href: "/teachers", label: "Teachers", icon: LuUserCog },
  { href: "/courses", label: "Courses", icon: LuBookOpen },
  { href: "/attendance", label: "Attendance", icon: LuCheck },
  { href: "/grades", label: "Grades", icon: LuGraduationCap },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data } = useSession();
  const sessionUser = (data as any)?.user as
    | { role?: string; permissions?: { module: string; canView: boolean }[] }
    | undefined;
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Map labels to permission.module keys used in DB
  const labelToModule: Record<string, string> = {
    Dashboard: "dashboard",
    Students: "students",
    Teachers: "teachers",
    Courses: "courses",
    Attendance: "attendance",
    Grades: "grades",
  };

  const allowed = nav.filter((item) => {
    // Admins see everything
    if (sessionUser?.role === "admin") return true;
    const moduleKey = labelToModule[item.label];
    if (!moduleKey) return true; // default to visible if not mapped
    const p = sessionUser?.permissions?.find((x) => x.module === moduleKey);
    return !!p?.canView;
  });

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static z-40 h-dvh md:h-auto top-0 left-0 w-72 md:w-64 text-white transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{
          backgroundImage: "linear-gradient(180deg, #0f172a 0%, #0b1220 100%)",
        }}
      >
        <div className="flex items-center gap-2 p-4 border-b border-white/10">
          <LuSchool className="text-[--color-primary]" size={24} />
          <div>
            <div className="font-semibold">EduElite</div>
            <div className="text-xs text-white/60">School Management</div>
          </div>
          <button className="md:hidden ml-auto" onClick={onClose} aria-label="Close sidebar">
            <LuX />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {allowed.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
                  active
                    ? "bg-[rgba(29,78,216,0.15)] text-white"
                    : "text-white/80 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={active ? "text-[--color-primary]" : "text-white/70"} />
                <span className="flex-1">{item.label}</span>
                {active && <span className="h-2 w-2 rounded-full bg-[--color-primary]" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
