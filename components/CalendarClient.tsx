// /app/(app)/calendar/CalendarClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { cn } from "@/lib/utils";
import type { Module, Track } from "@prisma/client";
type CalendarModule = Module & {
  track: Pick<Track, "title">;
};

interface CalendarClientProps {
  modules: CalendarModule[];
}

const localizer = momentLocalizer(moment);

export default function CalendarClient({ modules }: CalendarClientProps) {
  const [view, setView] = useState<keyof typeof Views>("month");

  // Conversion des modules en événements de calendrier
  const events = useMemo(
    () =>
      modules.map((m) => ({
        id: m.id,
        title: `${m.title} - ${m.track.title}`,
        start: m.startDate ? new Date(m.startDate) : new Date(),
        end: m.dueDate ? new Date(m.dueDate) : new Date(),
        allDay: false,
        resource: m.status,
      })),
    [modules]
  );
  // Couleur selon le statut du module
  const eventStyleGetter = (event: any) => {
    let bgColor = "";
    switch (event.resource) {
      case "todo":
        bgColor = "bg-blue-500";
        break;
      case "in_progress":
        bgColor = "bg-yellow-500";
        break;
      case "done":
        bgColor = "bg-green-600";
        break;
      default:
        bgColor = "bg-gray-400";
    }

    return {
      className: cn(
        "text-white px-2 py-1 rounded-md text-sm font-medium shadow-sm",
        bgColor
      ),
    };
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Calendrier</h1>

      <div className="rounded-lg border bg-background p-2">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "80vh" }}
          views={["month", "week", "day"]}
          view={view}
          onView={(v) => setView(v)}
          eventPropGetter={eventStyleGetter}
          messages={{
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            today: "Aujourd'hui",
            previous: "Précédent",
            next: "Suivant",
          }}
        />
      </div>
    </div>
  );
}
