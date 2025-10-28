// components/TagSelector.tsx
"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

type Props = {
  defaultTags?: string[];
  onChange?: (tags: string[]) => void;
  suggestions?: string[]; // tu peux lui passer tes tags disponibles si tu veux de l'auto-complétion simple
};

export function TagSelector({
  defaultTags = [],
  onChange,
  suggestions = [],
}: Props) {
  const [tags, setTags] = useState<string[]>(defaultTags);
  const [input, setInput] = useState("");

  function emit(next: string[]) {
    setTags(next);
    onChange?.(next);
  }

  function addTag(raw?: string) {
    const name = (raw ?? input).trim();
    if (!name) return;
    const next = Array.from(new Set([...tags, name]));
    emit(next);
    setInput("");
  }

  function removeTag(name: string) {
    emit(tags.filter((t) => t !== name));
  }

  const filteredSuggestions = useMemo(() => {
    const q = input.trim().toLowerCase();
    if (!q) return suggestions.filter((s) => !tags.includes(s));
    return suggestions.filter(
      (s) => !tags.includes(s) && s.toLowerCase().includes(q)
    );
  }, [input, suggestions, tags]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Ajouter un tag (ex: React)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" onClick={() => addTag()}>
          Ajouter
        </Button>
      </div>

      {filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {filteredSuggestions.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="underline"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Badge
            key={t}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="ml-1 rounded hover:bg-muted"
              aria-label={`Supprimer ${t}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Champ caché pour le FormData */}
      <input type="hidden" name="tags" value={JSON.stringify(tags)} />
    </div>
  );
}
