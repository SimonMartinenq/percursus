"use server";

import { revalidatePath } from "next/cache";
import { trackCreateSchema, trackUpdateSchema } from "@/lib/validators/track";
import { z } from "zod";
import { requireUser } from "../auth-helper";
import { prisma } from "@/prisma";
import { TrackStatus } from "@prisma/client";

export async function createTrack(formData: FormData) {
  const user = await requireUser();

  const parsed = trackCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    goals: formData.get("goals"),
    status: formData.get("status") || "draft",
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  console.log("CREATION de track", user, user.id, user.id!);
  const track = await prisma.track.create({
    data: {
      userId: user.id!,
      title: data.title,
      description: data.description || null,
      goals: data.goals || null,
      status: data.status as TrackStatus,
    },
  });

  revalidatePath("/tracks");
  return { ok: true, id: track.id };
}

export async function updateTrack(formData: FormData) {
  const user = await requireUser();

  const parsed = trackUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    goals: formData.get("goals"),
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { id, ...patch } = parsed.data;

  // Ownership check
  const existing = await prisma.track.findFirst({
    where: { id, userId: user.id! },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Parcours introuvable" };

  await prisma.track.update({
    where: { id },
    data: {
      ...patch,
    },
  });

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
