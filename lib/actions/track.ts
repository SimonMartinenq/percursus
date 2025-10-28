// lib/actions/track.ts
"use server";

import { revalidatePath } from "next/cache";
import { trackCreateSchema, trackUpdateSchema } from "@/lib/validators/track";
import { z } from "zod";
import { requireUser } from "../auth-helper";
import { prisma } from "@/prisma";
import { TrackStatus } from "@prisma/client";
import { upsertManyTagsByName } from "@/lib/actions/tag";

export async function createTrack(formData: FormData) {
  const user = await requireUser();

  // On construit un objet brut à partir du FormData
  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    goals: formData.get("goals"),
    status: formData.get("status") || "draft",
    tags: formData.get("tags") ?? "[]", // string JSON ou tableau déjà géré par le schema
  };

  const parsed = trackCreateSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const track = await prisma.track.create({
    data: {
      userId: user.id!,
      title: data.title,
      description: data.description || null,
      goals: data.goals || null,
      status: data.status as TrackStatus,
    },
  });

  // Gestion des tags
  if (data.tags?.length) {
    const tags = await upsertManyTagsByName(data.tags);
    if (tags.length) {
      await prisma.trackTag.createMany({
        data: tags.map((t) => ({ trackId: track.id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath("/tracks");
  return { ok: true, id: track.id };
}

export async function updateTrack(formData: FormData) {
  const user = await requireUser();

  const raw = {
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    goals: formData.get("goals"),
    status: formData.get("status") || undefined,
    tags: formData.get("tags") ?? undefined, // si absent on ne touche pas; si présent (même vide) on remplace
  };

  const parsed = trackUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, ...patch } = parsed.data;

  // Ownership check
  const existing = await prisma.track.findFirst({
    where: { id: id!, userId: user.id! },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Parcours introuvable" };

  await prisma.track.update({
    where: { id: id! },
    data: {
      title: patch.title ?? undefined,
      description: patch.description ?? undefined,
      goals: patch.goals ?? undefined,
      status: (patch.status as TrackStatus | undefined) ?? undefined,
    },
  });

  // Réconciliation des tags si fournis dans la requête
  if ("tags" in patch && Array.isArray(patch.tags)) {
    const tags = await upsertManyTagsByName(patch.tags);
    await prisma.trackTag.deleteMany({ where: { trackId: id! } });
    if (tags.length) {
      await prisma.trackTag.createMany({
        data: tags.map((t) => ({ trackId: id!, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath(`/tracks/${id}`);
  revalidatePath("/tracks");
  return { ok: true, id };
}

const DeleteSchema = z.object({ id: z.string().cuid() });

export async function deleteTrack(formData: FormData) {
  const user = await requireUser();

  const parsed = DeleteSchema.safeParse({
    id: formData.get("id"),
  });

  if (!parsed.success) {
    return { ok: false };
  }

  const { id } = parsed.data;

  // Ownership check
  const existing = await prisma.track.findFirst({
    where: { id, userId: user.id! },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Parcours introuvable" };

  await prisma.track.delete({ where: { id } });

  revalidatePath("/tracks");
  return { ok: true };
}
