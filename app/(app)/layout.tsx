// app/(app)/layout.tsx

import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full">
      <Header />
      <div className="mx-auto w-full">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
