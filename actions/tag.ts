// lib/actions/tag.ts
"use server";

import { prisma } from "@/prisma";
import { requireUser } from "@/lib/auth-helper";

export async function upsertManyTagsByName(names: string[]) {
  await requireUser();
  if (!names?.length) return [];

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
