"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createModule, updateModule } from "@/actions/module";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export type ModuleFormValues = {
  id?: string;
  trackId: string;
  title: string;
  externalUrl?: string;
  startDate?: string; // ISO
  dueDate?: string; // ISO
  status: "todo" | "in_progress" | "done";
};

type Props =
  | {
      mode: "create";
      trackId: string;
      defaultValues?: Partial<ModuleFormValues>;
    }
  | { mode: "edit"; defaultValues: ModuleFormValues };

export function ModuleForm(props: Props) {
  const isEdit = props.mode === "edit";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [open, setOpen] = useState(false);

  const [values, setValues] = useState<ModuleFormValues>({
    id: isEdit ? (props as any).defaultValues.id : undefined,
    trackId: isEdit
      ? (props as any).defaultValues.trackId
      : (props as any).trackId,
    title: props.defaultValues?.title ?? "",
    externalUrl: props.defaultValues?.externalUrl ?? "",
    startDate: props.defaultValues?.startDate ?? "",
    dueDate: props.defaultValues?.dueDate ?? "",
    status: (props.defaultValues?.status as any) ?? "todo",
  });

  function handleChange<K extends keyof ModuleFormValues>(
    key: K,
    v: ModuleFormValues[K]
  ) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    if (isEdit && values.id) fd.append("id", values.id);
    fd.append("trackId", values.trackId);
    fd.append("title", values.title);
    fd.append("externalUrl", values.externalUrl || "");
    fd.append("startDate", values.startDate || "");
    fd.append("dueDate", values.dueDate || "");
    fd.append("status", values.status);

    setErrors({});
    startTransition(async () => {
      const res = isEdit ? await updateModule(fd) : await createModule(fd);
      if (!res?.ok) {
        if ((res as any).errors) setErrors((res as any).errors);
        return;
      } else {
        setOpen(false);
      }
      router.refresh();
    });
  }

  // Convertir les dates ISO en objets Date
  const startDate = values.startDate ? new Date(values.startDate) : undefined;
  const dueDate = values.dueDate ? new Date(values.dueDate) : undefined;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{isEdit ? "Éditer" : "Ajouter un module"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Éditer le module" : "Nouveau module"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Module 1 – Bases de TypeScript"
              required
            />
            {errors?.title && (
              <p className="text-sm text-red-600">{errors.title.join(", ")}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="externalUrl">Lien externe</Label>
            <Input
              id="externalUrl"
              value={values.externalUrl ?? ""}
              onChange={(e) => handleChange("externalUrl", e.target.value)}
              placeholder="https://…"
            />
            {errors?.externalUrl && (
              <p className="text-sm text-red-600">
                {errors.externalUrl.join(", ")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? format(startDate, "PPP", { locale: fr })
                      : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) =>
                      handleChange("startDate", date?.toISOString() ?? "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors?.startDate && (
                <p className="text-sm text-red-600">
                  {errors.startDate.join(", ")}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, "PPP", { locale: fr })
                      : "Choisir une date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) =>
                      handleChange("dueDate", date?.toISOString() ?? "")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors?.dueDate && (
                <p className="text-sm text-red-600">
                  {errors.dueDate.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={values.status}
              onValueChange={(v: any) => handleChange("status", v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">À faire</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="done">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {isEdit ? "Enregistrer" : "Ajouter le module"}
            </Button>
          </div>
          {errors?.form && (
            <p className="text-sm text-red-600">{errors.form.join(", ")}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
