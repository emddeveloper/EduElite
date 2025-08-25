"use client";

import { LuBell, LuMenu } from "react-icons/lu";

export function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70 border-b border-black/10 dark:border-white/10">
      <div className="flex items-center gap-3 px-4 md:px-6 lg:px-8 h-14">
        <button className="md:hidden" onClick={onMenu} aria-label="Open menu">
          <LuMenu />
        </button>
        <h1 className="font-semibold text-lg">Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          <input className="input max-w-xs" placeholder="Search..." />
          <button className="relative p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5" aria-label="Notifications">
            <LuBell />
            <span className="absolute -top-1 -right-1 inline-flex h-2 w-2 rounded-full bg-[--color-accent]" />
          </button>
          <div className="h-8 w-8 rounded-full bg-[--color-primary] text-white grid place-items-center text-sm font-semibold">UE</div>
        </div>
      </div>
    </header>
  );
}
