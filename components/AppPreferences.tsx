// components/settings/AppPreferences.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";

type Preferences = {
  compactView: boolean;
  showProgressBar: boolean;
  defaultSearchQuery: string;
};

export function AppPreferences() {
  const [prefs, setPrefs] = useState<Preferences>({
    compactView: false,
    showProgressBar: true,
    defaultSearchQuery: "",
  });

  // Charger depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("app-preferences");
    if (stored) {
      try {
        setPrefs({ ...prefs, ...JSON.parse(stored) });
      } catch {}
    }
  }, []);

  // Sauvegarder automatiquement
  useEffect(() => {
    localStorage.setItem("app-preferences", JSON.stringify(prefs));
  }, [prefs]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Thème</Label>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-between">
            <Label>Vue compacte</Label>
            <Switch
              checked={prefs.compactView}
              onCheckedChange={(checked) =>
                setPrefs((p) => ({ ...p, compactView: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Afficher la barre de progression</Label>
            <Switch
              checked={prefs.showProgressBar}
              onCheckedChange={(checked) =>
                setPrefs((p) => ({ ...p, showProgressBar: checked }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Recherche par défaut</Label>
            <Input
              value={prefs.defaultSearchQuery}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, defaultSearchQuery: e.target.value }))
              }
              placeholder="Ex: TypeScript"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Ces préférences sont enregistrées localement dans votre navigateur et ne
        sont pas synchronisées sur le serveur.
      </p>
    </div>
  );
}
