// app/(app)/dashboard/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { prisma } from "@/prisma";
import { requireUser } from "@/lib/auth-helper";
import { DashboardCharts } from "./DashboardCharts";

export const dynamic = "force-dynamic";

function startOfWeek(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - day);
  return date;
}

function buildWeekBuckets(weeks = 8) {
  const buckets: { label: string; start: Date; end: Date }[] = [];
  const endOfThisWeek = new Date(startOfWeek());
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);
  for (let i = weeks - 1; i >= 0; i--) {
    const start = startOfWeek(new Date(endOfThisWeek));
    start.setDate(start.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    buckets.push({ label: `S${weeks - i}`, start, end });
  }
  return buckets;
}

export default async function DashboardPage() {
  const user = await requireUser();

  // ---- Fetch data ----
  const [tracks, modules, reminders] = await Promise.all([
    prisma.track.findMany({
      where: { userId: user.id! },
      select: { id: true, status: true },
    }),
    prisma.module.findMany({
      where: { track: { userId: user.id! } },
      select: { id: true, status: true, startDate: true, dueDate: true },
    }),
    prisma.reminder.findMany({
      where: { userId: user.id! },
      select: { id: true, runAt: true, sentAt: true },
      orderBy: { runAt: "asc" },
    }),
  ]);

  // ---- Core KPIs ----
  const totalTracks = tracks.length;
  const publishedTracks = tracks.filter((t) => t.status === "published").length;
  const totalModules = modules.length;
  const doneModules = modules.filter((m) => m.status === "done").length;
  const inProgressModules = modules.filter(
    (m) => m.status === "in_progress"
  ).length;
  const todoModules = totalModules - doneModules - inProgressModules;
  const overallProgress =
    totalModules === 0 ? 0 : Math.round((doneModules / totalModules) * 100);

  // ---- Deadlines & Reminders ----
  const now = new Date();
  const overdueModules = modules.filter(
    (m) => m.dueDate && m.dueDate < now && m.status !== "done"
  ).length;
  const upcoming7dReminders = reminders.filter(
    (r) => r.runAt > now && r.runAt < new Date(now.getTime() + 7 * 86400000)
  ).length;
  const nextReminder = reminders.find((r) => r.runAt > now);

  // ---- Weekly completions ----
  const weekBuckets = buildWeekBuckets(8);
  const doneChecks = await prisma.moduleCheck.findMany({
    where: {
      newStatus: "done",
      changedAt: { gte: weekBuckets[0].start },
      module: { track: { userId: user.id! } },
    },
    select: { changedAt: true },
  });

  const weeklyCompletionCounts = weekBuckets.map(
    (b) =>
      doneChecks.filter((c) => c.changedAt >= b.start && c.changedAt < b.end)
        .length
  );

  // ---- Daily activity ----
  const since14 = new Date();
  since14.setDate(since14.getDate() - 13);
  since14.setHours(0, 0, 0, 0);

  const checks14 = await prisma.moduleCheck.findMany({
    where: {
      changedAt: { gte: since14 },
      module: { track: { userId: user.id! } },
    },
    select: { changedAt: true },
  });

  const dailyData = Array.from({ length: 14 }, (_, i) => {
    const d0 = new Date(since14);
    d0.setDate(since14.getDate() + i);
    const d1 = new Date(d0);
    d1.setDate(d0.getDate() + 1);
    const count = checks14.filter(
      (c) => c.changedAt >= d0 && c.changedAt < d1
    ).length;
    return {
      date: d0.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "2-digit",
      }),
      count,
    };
  });

  // ---- Performance ----
  const onTimeCompletions = modules.filter(
    (m) =>
      m.status === "done" &&
      m.dueDate &&
      m.startDate &&
      m.dueDate >= m.startDate
  ).length;
  const onTimeRate =
    doneModules === 0 ? 0 : Math.round((onTimeCompletions / doneModules) * 100);

  const averageDurationDays = (() => {
    const durations = modules
      .filter((m) => m.startDate && m.dueDate)
      .map((m) => (m.dueDate!.getTime() - m.startDate!.getTime()) / 86400000);
    return durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
  })();

  // ---- Data for charts ----
  const weeklyData = weekBuckets.map((b, i) => ({
    name: b.label,
    value: weeklyCompletionCounts[i],
  }));

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suivez vos parcours, modules et progression globale.
          </p>
        </div>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Progression globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{overallProgress}%</div>
              <div className="text-xs text-muted-foreground">
                {doneModules}/{totalModules} modules
              </div>
            </div>
            <Progress className="mt-3 h-2" value={overallProgress} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Parcours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTracks}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {publishedTracks} publié(s)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Modules en retard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                overdueModules > 0 ? "text-red-600" : ""
              }`}
            >
              {overdueModules}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {totalModules === 0
                ? "—"
                : `${Math.round(
                    (overdueModules / totalModules) * 100
                  )}% des modules`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Rappels à venir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{upcoming7dReminders}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {nextReminder
                ? `Prochain : ${new Date(nextReminder.runAt).toLocaleString()}`
                : "Aucun prévu"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts
        weeklyData={weeklyData}
        dailyData={dailyData}
        statusData={{
          todo: todoModules,
          inProgress: inProgressModules,
          done: doneModules,
          total: totalModules,
        }}
        performance={{
          onTimeRate,
          averageDurationDays,
        }}
      />
    </div>
  );
}
