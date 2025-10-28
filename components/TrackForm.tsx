// components/TrackForm.tsx
"use client";

import * as React from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import { TagSelector } from "./TagSelector";

type BaseValues = {
  title: string;
  description?: string;
  goals?: string;
  status: "draft" | "published";
  tags: string[];
};

type Props =
  | { mode: "create"; defaultValues?: Partial<BaseValues>; id?: never }
  | { mode: "edit"; id: string; defaultValues: BaseValues };

export function TrackForm(props: Props) {
  const isEdit = props.mode === "edit";
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [values, setValues] = useState<BaseValues>({
    title: props.defaultValues?.title ?? "",
    description: props.defaultValues?.description ?? "",
    goals: props.defaultValues?.goals ?? "",
    status: (props.defaultValues?.status as any) ?? "draft",
    tags: props.defaultValues?.tags ?? [],
  });

  function set<K extends keyof BaseValues>(key: K, v: BaseValues[K]) {
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
    fd.append("tags", JSON.stringify(values.tags || []));

    setErrors({});
    startTransition(async () => {
      const res = isEdit ? await updateTrack(fd) : await createTrack(fd);
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
          onChange={(e) => set("title", e.target.value)}
          placeholder="Ex: « Roadmap TypeScript »"
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
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          placeholder="Objectif général, sources, etc."
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
          value={values.goals}
          onChange={(e) => set("goals", e.target.value)}
          rows={4}
          placeholder="Compétences visées, jalons, critères de succès…"
        />
        {errors?.goals && (
          <p className="text-sm text-red-600">{errors.goals.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Statut</Label>
        <Select
          value={values.status}
          onValueChange={(v: any) => set("status", v)}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Choisir…" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>
        {errors?.status && (
          <p className="text-sm text-red-600">{errors.status.join(", ")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagSelector
          defaultTags={values.tags}
          onChange={(t) => set("tags", t)}
        />
        {errors?.tags && (
          <p className="text-sm text-red-600">{errors.tags.join(", ")}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending}>
          {isEdit ? "Enregistrer" : "Créer le parcours"}
        </Button>
      </div>

      {errors?.form && (
        <p className="text-sm text-red-600">{errors.form.join(", ")}</p>
      )}
    </form>
  );
}
