"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    // Full-screen auth layout without sidebar/header, with colorful background
    return (
      <div className="min-h-dvh w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-400 dark:from-indigo-700 dark:via-sky-700 dark:to-emerald-600" />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-black/10 dark:bg-black/30 blur-3xl opacity-40" />
        <div className="relative min-h-dvh flex items-center justify-center p-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex bg-[--color-background] text-[--color-foreground]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header onMenu={() => setOpen((v) => !v)} />
        <main className="p-4 md:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 min-h-[calc(100dvh-56px)]">
          <div className="max-w-10xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
