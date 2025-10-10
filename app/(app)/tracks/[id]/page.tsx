import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { deleteTrack } from "@/lib/actions/track";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { requireUser } from "@/lib/auth-helper";
import { prisma } from "@/prisma";
import { TrackForm } from "@/components/TrackForm";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const track = await prisma.track.findFirst({
    where: { id: id, userId: user.id! },
  });

  if (!track) return notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{track.title}</h1>
          <Badge
            variant={track.status === "published" ? "default" : "secondary"}
          >
            {track.status === "published" ? "Publié" : "Brouillon"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tracks">
            <Button variant="outline">Retour</Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Supprimer</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer ce parcours ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. Les modules liés (quand tu les
                  ajouteras) seront aussi supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <form action={deleteTrack}>
                <input type="hidden" name="id" value={track.id} />
                <div className="mt-4 flex justify-end gap-2">
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction type="submit">Supprimer</AlertDialogAction>
                </div>
              </form>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Éditer le parcours</CardTitle>
        </CardHeader>
        <CardContent>
          <TrackForm
            mode="edit"
            id={track.id}
            defaultValues={{
              title: track.title,
              description: track.description ?? "",
              goals: track.goals ?? "",
              status: track.status as "draft" | "published",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Métadonnées</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <div>Créé le : {new Date(track.createdAt).toLocaleString()}</div>
          <div>Dernière MAJ : {new Date(track.updatedAt).toLocaleString()}</div>
          <div>ID : {track.id}</div>
        </CardContent>
      </Card>
    </div>
  );
}
