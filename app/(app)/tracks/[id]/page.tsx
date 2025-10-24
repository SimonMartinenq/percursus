//(app)/track/:id/page.tsx
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
import { deleteModule } from "@/lib/actions/module";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ModuleForm } from "@/components/ModuleForm";
import { Progress } from "@/components/ui/progress";

export default async function TrackDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const track = await prisma.track.findFirst({
    where: { id: id, userId: user.id! },
    include: {
      modules: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          externalUrl: true,
          startDate: true,
          dueDate: true,
          status: true,
          position: true,
        },
      },
    },
  });

  if (!track) return notFound();
  const totalModules = track.modules.length;
  const doneModules = track.modules.filter((m) => m.status === "done").length;
  const progress =
    totalModules === 0 ? 0 : Math.round((doneModules / totalModules) * 100);

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
          <CardTitle>Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Avancement global</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Modules ({track.modules.length})</CardTitle>
          <ModuleForm mode="create" trackId={track.id} />
        </CardHeader>
        <CardContent>
          {track.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun module pour l’instant.
            </p>
          ) : (
            <ul className="space-y-3">
              {track.modules.map((m) => (
                <li key={m.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{m.title}</span>
                        <Badge
                          variant={
                            m.status === "done"
                              ? "default"
                              : m.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {m.status === "todo"
                            ? "À faire"
                            : m.status === "in_progress"
                            ? "En cours"
                            : "Terminé"}
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.externalUrl ? (
                          <a
                            className="underline break-all"
                            href={m.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {m.externalUrl}
                          </a>
                        ) : (
                          "—"
                        )}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.startDate
                          ? `Début: ${new Date(m.startDate).toLocaleString()}`
                          : ""}
                        {m.dueDate
                          ? ` · Échéance: ${new Date(
                              m.dueDate
                            ).toLocaleString()}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <ModuleForm
                        mode="edit"
                        defaultValues={{
                          id: m.id,
                          trackId: track.id,
                          title: m.title,
                          externalUrl: m.externalUrl ?? "",
                          startDate: m.startDate
                            ? new Date(m.startDate).toISOString().slice(0, 16)
                            : "",
                          dueDate: m.dueDate
                            ? new Date(m.dueDate).toISOString().slice(0, 16)
                            : "",
                          status: m.status as any,
                        }}
                      />
                      {/* Delete */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Supprimer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Supprimer ce module ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <form action={deleteModule}>
                            <input type="hidden" name="id" value={m.id} />
                            <div className="mt-4 flex justify-end gap-2">
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction type="submit">
                                Supprimer
                              </AlertDialogAction>
                            </div>
                          </form>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
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
