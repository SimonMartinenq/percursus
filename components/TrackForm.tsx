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
import { toast } from "sonner";

type BaseValues = {
  title: string;
  description?: string;
  goals?: string;
  status: "draft" | "published";
  tags: string[];
};

type Props =
  | {
      mode: "create";
      defaultValues?: Partial<BaseValues>;
      id?: never;
      onCreated?: () => void;
    }
  | { mode: "edit"; id: string; defaultValues: BaseValues; onCreated?: never };

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

  function resetForm() {
    setValues({
      title: "",
      description: "",
      goals: "",
      status: "draft",
      tags: [],
    });
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

      if (isEdit) {
        toast.success("Parcours mis à jour avec succès");
      } else {
        toast.success("Parcours créé avec succès");
        resetForm();
        props.onCreated?.();
      }
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
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <TagSelector
          defaultTags={values.tags}
          onChange={(t) => set("tags", t)}
        />
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
