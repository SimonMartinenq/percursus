"use server";

import { prisma } from "@/prisma";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth-helper";

export async function createModule(formData: FormData) {
  const user = await requireUser();

  try {
    const trackId = formData.get("trackId") as string;
    const title = (formData.get("title") as string)?.trim();
    const externalUrl = (formData.get("externalUrl") as string)?.trim() || null;
    const startDateStr = formData.get("startDate") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const status =
      (formData.get("status") as "todo" | "in_progress" | "done") ?? "todo";

    if (!title) {
      return { ok: false, errors: { title: ["Le titre est requis."] } };
    }

    const track = await prisma.track.findFirst({
      where: { id: trackId, userId: user.id },
    });

    if (!track) {
      return {
        ok: false,
        errors: { form: ["Parcours introuvable ou non autorisé."] },
      };
    }

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    await prisma.module.create({
      data: {
        trackId,
        title,
        externalUrl,
        startDate,
        dueDate,
        status,
        checks: {
          create: {
            newStatus: status,
            note: "Module créé",
          },
        },
      },
    });

    revalidatePath(`/tracks/${trackId}`);
    return { ok: true };
  } catch (error) {
    console.error("[createModule]", error);
    return { ok: false, errors: { form: ["Une erreur est survenue."] } };
  }
}

export async function updateModule(formData: FormData) {
  const user = await requireUser();

  try {
    const id = formData.get("id") as string;
    const title = (formData.get("title") as string)?.trim();
    const externalUrl = (formData.get("externalUrl") as string)?.trim() || null;
    const startDateStr = formData.get("startDate") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const newStatus =
      (formData.get("status") as "todo" | "in_progress" | "done") ?? "todo";

    if (!id || !title) {
      return { ok: false, errors: { form: ["Champs manquants."] } };
    }

    const existing = await prisma.module.findFirst({
      where: {
        id,
        track: { userId: user.id },
      },
      select: { id: true, trackId: true, status: true },
    });

    if (!existing) {
      return {
        ok: false,
        errors: { form: ["Module introuvable ou non autorisé."] },
      };
    }

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;

    const updated = await prisma.module.update({
      where: { id },
      data: {
        title,
        externalUrl,
        startDate,
        dueDate,
        status: newStatus,
      },
    });

    if (existing.status !== newStatus) {
      await prisma.moduleCheck.create({
        data: {
          moduleId: id,
          oldStatus: existing.status,
          newStatus,
          note: `Statut modifié de ${existing.status} → ${newStatus}`,
        },
      });
    }

    revalidatePath(`/tracks/${existing.trackId}`);
    return { ok: true };
  } catch (error) {
    console.error("[updateModule]", error);
    return { ok: false, errors: { form: ["Une erreur est survenue."] } };
  }
}

export async function deleteModule(formData: FormData) {
  const user = await requireUser();

  try {
    const id = formData.get("id") as string;

    const module = await prisma.module.findFirst({
      where: { id, track: { userId: user.id } },
      select: { id: true, trackId: true },
    });

    if (!module) {
      return {
        ok: false,
        errors: { form: ["Module introuvable ou non autorisé."] },
      };
    }

    await prisma.module.delete({ where: { id } });

    revalidatePath(`/tracks/${module.trackId}`);
    return { ok: true };
  } catch (error) {
    console.error("[deleteModule]", error);
    return { ok: false, errors: { form: ["Une erreur est survenue."] } };
  }
}
