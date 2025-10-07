// components/header.tsx
"use client";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { MobileSidebar } from "./MobileSidebar";
import { SearchBar } from "./Search";
import { ThemeToggle } from "./ThemeToggle";
import { UserNav } from "./UserNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="h-14 flex items-center gap-3 px-3 md:px-6">
        <div className="md:hidden">
          <MobileSidebar />
        </div>
        <div className="font-semibold">Learning Tracker</div>
        <Separator orientation="vertical" className="hidden md:block h-6" />
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
