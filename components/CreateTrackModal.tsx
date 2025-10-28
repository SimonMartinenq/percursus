"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TrackForm } from "./TrackForm";

const CreateTrackModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Créer un parcours</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nouveau parcours</DialogTitle>
        </DialogHeader>
        <TrackForm mode="create" onCreated={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateTrackModal;
