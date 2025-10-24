// /lib/actions/module.ts
"use server";

import { prisma } from "@/prisma";
import { requireUser } from "@/lib/auth-helper";
import {
  createModuleSchema,
  updateModuleSchema,
} from "@/lib/validators/module";

function toErrorRecord(issue: any) {
  const out: Record<string, string[]> = {};
  for (const e of issue) {
    const k = e.path?.[0] ?? "form";
    out[k] = [...(out[k] ?? []), e.message];
  }
  return out;
}

export async function createModule(fd: FormData) {
  try {
    const user = await requireUser();
    const payload = Object.fromEntries(fd.entries());
    const parsed = createModuleSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false, errors: toErrorRecord(parsed.error.issues) };
    }

    // Secure: verifier ownership du track
    const track = await prisma.track.findFirst({
      where: { id: parsed.data.trackId, userId: user.id! },
      select: { id: true },
    });
    if (!track)
      return { ok: false, errors: { form: ["Parcours introuvable"] } };

    // position = dernier + 1
    const last = await prisma.module.findFirst({
      where: { trackId: track.id },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const nextPos = (last?.position ?? -1) + 1;

    const created = await prisma.module.create({
      data: {
        trackId: track.id,
        title: parsed.data.title,
        externalUrl: parsed.data.externalUrl,
        startDate: parsed.data.startDate
          ? new Date(parsed.data.startDate)
          : undefined,
        dueDate: parsed.data.dueDate
          ? new Date(parsed.data.dueDate)
          : undefined,
        status: parsed.data.status,
        position: nextPos,
      },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { form: ["Erreur serveur"] } };
  }
}

export async function updateModule(fd: FormData) {
  try {
    const user = await requireUser();
    const payload = Object.fromEntries(fd.entries());
    const parsed = updateModuleSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false, errors: toErrorRecord(parsed.error.issues) };
    }

    const mod = await prisma.module.findFirst({
      where: { id: parsed.data.id, track: { userId: user.id! } },
      select: { id: true },
    });
    if (!mod) return { ok: false, errors: { form: ["Module introuvable"] } };

    await prisma.module.update({
      where: { id: parsed.data.id },
      data: {
        title: parsed.data.title,
        externalUrl: parsed.data.externalUrl,
        startDate: parsed.data.startDate
          ? new Date(parsed.data.startDate)
          : null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        status: parsed.data.status,
      },
    });

    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { form: ["Erreur serveur"] } };
  }
}

export async function deleteModule(fd: FormData) {
  try {
    const user = await requireUser();
    const id = String(fd.get("id") ?? "");
    if (!id) return { ok: false, errors: { id: ["id requis"] } };

    const mod = await prisma.module.findFirst({
      where: { id, track: { userId: user.id! } },
      select: { id: true },
    });
    if (!mod) return { ok: false, errors: { form: ["Module introuvable"] } };

    await prisma.module.delete({ where: { id } });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, errors: { form: ["Erreur serveur"] } };
  }
}
