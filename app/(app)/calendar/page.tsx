// /app/(app)/calendar/page.tsx
import CalendarClient from "@/components/CalendarClient";
import { requireUser } from "@/lib/auth-helper";
import { prisma } from "@/prisma";

export default async function Page() {
  const user = await requireUser();

  const modules = await prisma.module.findMany({
    where: { track: { userId: user.id } },
    include: { track: { select: { title: true } } },
    orderBy: { startDate: "asc" },
  });

  return <CalendarClient modules={modules} />;
}
