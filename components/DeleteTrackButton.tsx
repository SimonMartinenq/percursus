"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteTrack } from "@/actions/track";

export function DeleteTrackButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    const fd = new FormData();
    fd.append("id", id);
    startTransition(async () => {
      try {
        await deleteTrack(fd); // redirige côté serveur
        toast.success("Parcours supprimé avec succès");
      } catch (e) {
        console.log("ERROR", e);
        toast.error("Erreur lors de la suppression");
      } finally {
        router.push("/tracks"); // fallback sécurité
      }
    });
  }

  return (
    <Button variant="destructive" disabled={pending} onClick={handleDelete}>
      Supprimer
    </Button>
  );
}
