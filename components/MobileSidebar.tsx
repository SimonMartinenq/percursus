// components/mobile-sidebar.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-72">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        {/* On réutilise la Sidebar (elle est hidden md: donc on force l’affichage ici) */}
        <div className="block md:hidden">
          <div className="flex flex-col h-[calc(100dvh-57px)]">
            {/* clone simplifié : */}
            <Sidebar />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
