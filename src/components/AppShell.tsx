"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
