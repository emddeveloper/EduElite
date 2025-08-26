"use client";

import { LuBell, LuMenu, LuUser, LuSettings, LuShield, LuLogOut } from "react-icons/lu";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

function useClock() {
  const [now, setNow] = React.useState<string>(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  );
  React.useEffect(() => {
    const id = setInterval(() => {
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Header({ onMenu }: { onMenu: () => void }) {
  const time = useClock();
  const { data } = useSession();
  const user = (data as any)?.user as { username?: string; email?: string; role?: string } | undefined;
  const initials = React.useMemo(() => {
    const name = user?.username || user?.email || "User";
    const parts = String(name).split(/[\s@._-]+/).filter(Boolean);
    const first = parts[0]?.[0] || "U";
    const second = parts[1]?.[0] || "E";
    return (first + second).toUpperCase();
  }, [user]);

  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <header className="sticky top-0 z-20 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-3 px-4 md:px-6 lg:px-8 h-14">
        <button className="md:hidden" onClick={onMenu} aria-label="Open menu">
          <LuMenu />
        </button>
        <div className="ml-auto flex items-center gap-3">
          <input className="input max-w-xs" placeholder="Search..." />
          {/* Desktop-only digital clock */}
          <div className="hidden md:flex items-center font-mono tabular-nums text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap ml-2 px-3">
            {time}
          </div>
          <button className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg:white/5" aria-label="Notifications">
            <LuBell />
            <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-[--color-accent]" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[--color-primary] border border-[--color-primary] grid place-items-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[--color-primary]/40"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              {initials}
            </button>
            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden"
              >
                <div className="px-3 py-2 text-sm border-b border-black/5 dark:border-white/10">
                  <div className="font-medium">
                    {user?.username || user?.email || "User"}
                  </div>
                  <div className="text-neutral-500 text-xs">{user?.role || "user"}</div>
                </div>
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5">
                    <LuUser />
                    Profile Settings
                  </Link>
                  {user?.role === "admin" && (
                    <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg:white/5">
                      <LuShield />
                      User Management
                    </Link>
                  )}
                  <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg:white/5">
                    <LuSettings />
                    App Settings
                  </Link>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-t border-black/5 dark:border-white/10"
                >
                  <LuLogOut />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
