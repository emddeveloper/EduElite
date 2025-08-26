"use client";

import { LuBell, LuMenu } from "react-icons/lu";
import React from "react";

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
  return (
    <header className="sticky top-0 z-20 bg-white/80 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-900/70 border-b border-neutral-200 dark:border-white/10 shadow-sm">
      <div className="flex items-center gap-3 px-4 md:px-6 lg:px-8 h-14">
        <button className="md:hidden" onClick={onMenu} aria-label="Open menu">
          <LuMenu />
        </button>
        <h1 className="font-semibold text-lg">Dashboard</h1>
        <div className="ml-auto flex items-center gap-3">
          <input className="input max-w-xs" placeholder="Search..." />
          {/* Desktop-only digital clock */}
          <div className="hidden md:flex items-center font-mono tabular-nums text-sm text-neutral-700 dark:text-neutral-300 whitespace-nowrap ml-2 px-3">
            {time}
          </div>
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
