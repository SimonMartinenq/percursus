// lib/actions/tag.ts
"use server";

import { prisma } from "@/prisma";
import { requireUser } from "@/lib/auth-helper";

export async function upsertManyTagsByName(names: string[]) {
  await requireUser(); // existence session; tags ne sont pas multi-tenant dans le schéma, mais on conserve la vérif auth
  if (!names?.length) return [];

  // Upsert en série (pour garder simplicité et compatibilité Postgres)
  const results = [];
  for (const name of names) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    results.push(tag);
  }
  return results;
}
