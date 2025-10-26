// /app/api/search/route.ts
import { requireUser } from "@/lib/auth-helper";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ tracks: [], modules: [] });
  const user = await requireUser();

  const [tracks, modules] = await Promise.all([
    prisma.track.findMany({
      where: {
        userId: user.id,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, description: true },
      take: 5,
    }),
    prisma.module.findMany({
      where: {
        track: { userId: user.id },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { track: { title: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        title: true,
        trackId: true,
        track: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 5,
    }),
  ]);

  return NextResponse.json({ tracks, modules });
}
