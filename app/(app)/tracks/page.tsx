//(app)/track/page.tsx
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

export const dynamic = "force-dynamic";

export default async function TracksPage() {
  const user = await requireUser();

  const tracks = await prisma.track.findMany({
    where: { userId: user.id! },
    orderBy: { updatedAt: "desc" },
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

      {tracks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aucun parcours pour l’instant. Crée ton premier !
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
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
                  <p className="mt-4 text-xs text-muted-foreground">
                    MAJ : {new Date(t.updatedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
