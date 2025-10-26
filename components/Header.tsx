// components/Header.tsx
"use client";

import { SearchBar } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Header() {
  return (
    <header
      className="
        sticky top-2 z-40 mx-2 md:mx-4
        rounded-xl border
        bg-background/70 backdrop-blur-md
        supports-[backdrop-filter]:bg-background/60
        shadow-md transition-all
      "
    >
      <div className="h-14 flex items-center gap-3 px-3 md:px-6">
        <SidebarTrigger className="-ml-1" />

        <div className="font-semibold">Learning Tracker</div>

        <div className="flex-1 flex justify-center md:justify-start">
          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
