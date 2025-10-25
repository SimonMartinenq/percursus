"use client";

import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import type { View } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { Module, Track } from "@prisma/client";
import { Button } from "@/components/ui/button";
// ---- Types ----
type CalendarModule = Module & {
  track: Pick<Track, "title">;
};

interface CalendarClientProps {
  modules: CalendarModule[];
}

// ---- Localizer & locale ----
moment.locale("fr");
const localizer = momentLocalizer(moment);

// ---- Toolbar personnalisé ----
type ToolbarProps = {
  label: string;
  onNavigate: (
    action: "PREV" | "NEXT" | "TODAY" | "DATE",
    newDate?: Date
  ) => void;
  onView: (view: View) => void;
  view: View;
};

function Toolbar({ label, onNavigate, onView, view }: ToolbarProps) {
  return (
    <div className="rbc-toolbar flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onNavigate("TODAY")}>
          Aujourd&apos;hui
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("PREV")}>
          Précédent
        </Button>
        <Button variant="outline" size="sm" onClick={() => onNavigate("NEXT")}>
          Suivant
        </Button>
      </div>

      <span className="text-base font-medium">{label}</span>

      <div className="flex items-center gap-2">
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("month")}
        >
          Mois
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("week")}
        >
          Semaine
        </Button>
        <Button
          variant={view === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => onView("day")}
        >
          Jour
        </Button>
      </div>
    </div>
  );
}

export default function CalendarClient({ modules }: CalendarClientProps) {
  const [view, setView] = useState<View>("month");
  const [date, setDate] = useState<Date>(new Date());

  // Conversion des modules en événements
  const events = useMemo(
    () =>
      modules.map((m) => {
        const start = m.startDate
          ? new Date(m.startDate)
          : m.dueDate
          ? new Date(m.dueDate)
          : new Date();
        // Si pas de dueDate, on met 1h après pour éviter un event 0 durée
        const end = m.dueDate
          ? new Date(m.dueDate)
          : new Date(start.getTime() + 60 * 60 * 1000);

        return {
          id: m.id,
          title: `${m.track.title} – ${m.title}`,
          start,
          end,
          allDay: false,
          resource: m.status,
        };
      }),
    [modules]
  );

  const eventStyleGetter = (event: any) => {
    const palette: Record<
      string,
      { bg: string; border: string; text: string }
    > = {
      todo: { bg: "#3b82f6", border: "#3b82f6", text: "#ffffff" },
      in_progress: { bg: "#eab308", border: "#eab308", text: "#111827" }, // texte sombre sur fond jaune
      done: { bg: "#16a34a", border: "#16a34a", text: "#ffffff" },
      default: { bg: "#9ca3af", border: "#9ca3af", text: "#111827" },
    };

    const c =
      palette[event?.resource as keyof typeof palette] ?? palette.default;

    return {
      style: {
        backgroundColor: c.bg,
        borderColor: c.border,
        color: c.text,
        borderRadius: "0.375rem",
        padding: "0.25rem 0.5rem",
        fontWeight: 500,
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      },
      className: "text-sm",
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
          view={view}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(actionOrDate) => {
            if (actionOrDate instanceof Date) {
              setDate(actionOrDate);
            }
          }}
          views={{
            month: true,
            week: true,
            day: true,
          }}
          components={{
            toolbar: (props) => (
              <Toolbar
                label={props.label}
                onNavigate={props.onNavigate}
                onView={props.onView}
                view={view}
              />
            ),
          }}
          culture="fr"
          messages={{
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            today: "Aujourd'hui",
            previous: "Précédent",
            next: "Suivant",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucun événement dans cette période",
          }}
          eventPropGetter={eventStyleGetter}
          style={{ height: "80vh" }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-blue-500" />À faire
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-yellow-500" />
          En cours
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-green-600" />
          Terminé
        </span>
      </div>
    </div>
  );
}
