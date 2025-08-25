"use client";

import Link from "next/link";
import { useEffect } from "react";
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
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed md:static z-40 h-dvh md:h-auto top-0 left-0 w-72 md:w-64 bg-white/90 dark:bg-neutral-900 border-r border-black/10 dark:border-white/10 transition-transform ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex items-center gap-2 p-4 border-b border-black/10 dark:border-white/10">
          <LuSchool className="text-[--color-primary]" size={24} />
          <div>
            <div className="font-semibold">EduElite</div>
            <div className="text-xs text-neutral-500">School Management</div>
          </div>
          <button className="md:hidden ml-auto" onClick={onClose} aria-label="Close sidebar">
            <LuX />
          </button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">
              <item.icon className="text-[--color-primary]" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
