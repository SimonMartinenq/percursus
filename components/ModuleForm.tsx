// /components/ModuleForm.tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createModule, updateModule } from "@/lib/actions/module";
import { useRouter } from "next/navigation";

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
      }
      router.refresh();
    });
  }

  return (
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
          <Input
            id="startDate"
            type="datetime-local"
            value={values.startDate ?? ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
          />
          {errors?.startDate && (
            <p className="text-sm text-red-600">
              {errors.startDate.join(", ")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Échéance</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={values.dueDate ?? ""}
            onChange={(e) => handleChange("dueDate", e.target.value)}
          />
          {errors?.dueDate && (
            <p className="text-sm text-red-600">{errors.dueDate.join(", ")}</p>
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
  );
}
