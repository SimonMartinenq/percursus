// (app)/tracks/page.tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { requireUser } from "@/lib/auth-helper";
import { prisma } from "@/prisma";
import { TrackForm } from "@/components/TrackForm";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { computeProgress } from "@/lib/utils";
import { TrackFilters } from "@/components/TrackFilters";

export const dynamic = "force-dynamic";

export default async function TracksPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const user = await requireUser();
  searchParams = await searchParams;

  // Tags dispos (pour suggestions)
  const tags = await prisma.tag.findMany({
    where: { trackTags: { some: { track: { userId: user.id } } } },
    select: { name: true },
  });
  const availableTags = tags.map((t) => t.name);

  const where: any = {
    userId: user.id,
    ...(searchParams?.q
      ? {
          OR: [
            { title: { contains: searchParams.q, mode: "insensitive" } },
            { description: { contains: searchParams.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(searchParams?.status ? { status: searchParams.status } : {}),
    ...(searchParams?.updatedAfter
      ? { updatedAt: { gte: new Date(searchParams.updatedAfter as string) } }
      : {}),
    ...(searchParams?.updatedBefore
      ? { updatedAt: { lte: new Date(searchParams.updatedBefore as string) } }
      : {}),
    ...(searchParams?.tags
      ? {
          trackTags: {
            some: {
              tag: {
                name: {
                  in: Array.isArray(searchParams.tags)
                    ? searchParams.tags
                    : [searchParams.tags],
                },
              },
            },
          },
        }
      : {}),
  };

  const [sortField, sortOrder] = (searchParams?.sort as string)?.split("_") ?? [
    "updatedAt",
    "desc",
  ];

  const tracks = await prisma.track.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
    include: {
      modules: { select: { status: true } },
      trackTags: { include: { tag: true } },
    },
  });

  const progressMin = Number(searchParams?.progressMin ?? 0);
  const progressMax = Number(searchParams?.progressMax ?? 100);

  const filteredTracks = tracks.filter((t) => {
    const progress = computeProgress(t);
    return progress >= progressMin && progress <= progressMax;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mes parcours</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Créer un parcours</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Nouveau parcours</DialogTitle>
            </DialogHeader>
            <TrackForm mode="create" />
          </DialogContent>
        </Dialog>
      </div>

      <TrackFilters availableTags={availableTags} />

      {filteredTracks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucun parcours trouvé.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTracks.map((t) => (
            <Link key={t.id} href={`/tracks/${t.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">{t.title}</CardTitle>
                    <Badge
                      variant={
                        t.status === "published" ? "default" : "secondary"
                      }
                    >
                      {t.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {t.description || "—"}
                  </p>
                  {t.trackTags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.trackTags.map((tt) => (
                        <Badge key={tt.tag.name} variant="outline">
                          {tt.tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="mt-4 text-xs text-muted-foreground">
                    MAJ : {new Date(t.updatedAt).toLocaleString()}
                  </p>
                  {t.modules.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progression</span>
                        <span>{computeProgress(t)}%</span>
                      </div>
                      <Progress value={computeProgress(t)} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
