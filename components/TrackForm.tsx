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
import { createTrack, updateTrack } from "@/lib/actions/track";
import { useRouter } from "next/navigation";

type Props =
  | { mode: "create"; defaultValues?: Partial<TrackFormValues> }
  | { mode: "edit"; id: string; defaultValues: TrackFormValues };

type TrackFormValues = {
  title: string;
  description?: string | null;
  goals?: string | null;
  status: "draft" | "published";
};

export function TrackForm(props: Props) {
  const isEdit = props.mode === "edit";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [values, setValues] = useState<TrackFormValues>({
    title: props.defaultValues?.title ?? "",
    description: props.defaultValues?.description ?? "",
    goals: props.defaultValues?.goals ?? "",
    status: (props.defaultValues?.status as "draft" | "published") ?? "draft",
  });

  function handleChange<K extends keyof TrackFormValues>(
    key: K,
    v: TrackFormValues[K]
  ) {
    setValues((s) => ({ ...s, [key]: v }));
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    if (isEdit) fd.append("id", (props as any).id);
    fd.append("title", values.title);
    fd.append("description", values.description || "");
    fd.append("goals", values.goals || "");
    fd.append("status", values.status);

    setErrors({});
    startTransition(async () => {
      const res = isEdit ? await updateTrack(fd) : await createTrack(fd);
      if (!res?.ok) {
        if ((res as any).errors) setErrors((res as any).errors);
        return;
      }
      if (!isEdit && res.id) router.push(`/tracks/${res.id}`);
      else router.refresh();
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
          placeholder="Ex: Apprendre React de A à Z"
          required
        />
        {errors?.title && (
          <p className="text-sm text-red-600">{errors.title.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description ?? ""}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Contexte, contenu, attentes…"
          rows={4}
        />
        {errors?.description && (
          <p className="text-sm text-red-600">
            {errors.description.join(", ")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">Objectifs</Label>
        <Textarea
          id="goals"
          value={values.goals ?? ""}
          onChange={(e) => handleChange("goals", e.target.value)}
          placeholder="Objectifs du parcours (liste libre)"
          rows={3}
        />
        {errors?.goals && (
          <p className="text-sm text-red-600">{errors.goals.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={values.status}
          onValueChange={(v: "draft" | "published") =>
            handleChange("status", v)
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {isEdit ? "Enregistrer" : "Créer le parcours"}
        </Button>
      </div>
    </form>
  );
}
