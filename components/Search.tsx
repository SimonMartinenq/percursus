// components/search.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Track, Module } from "@prisma/client";
import { useDebounce } from "@/hooks/use-debounce";

type SearchResult = {
  tracks: Pick<Track, "id" | "title" | "description">[];
  modules: (Pick<Module, "id" | "title" | "trackId"> & {
    track: Pick<Track, "id" | "title"> | null;
  })[];
};

export function SearchBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    tracks: [],
    modules: [],
  });
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // --- Requête API (filtrée sur user)
  useEffect(() => {
    if (!debouncedQuery) {
      setResults({ tracks: [], modules: [] });
      setOpen(false);
      return;
    }

    const fetchResults = async () => {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!res.ok) return;
      const data = (await res.json()) as SearchResult;
      setResults(data);
      setOpen(true);
    };

    fetchResults();
  }, [debouncedQuery]);

  // --- Fermer si clic à l’extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <Input
        ref={inputRef}
        name="q"
        placeholder="Rechercher un parcours ou un module…"
        className="w-full"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (results.tracks.length || results.modules.length) setOpen(true);
        }}
      />

      {open && (results.tracks.length > 0 || results.modules.length > 0) && (
        <Card className="absolute top-full mt-2 w-full shadow-lg border bg-popover z-50">
          {results.tracks.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground mb-1">Parcours</p>
              {results.tracks.map((t) => (
                <Link
                  key={t.id}
                  href={`/tracks/${t.id}`}
                  className="block px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-medium">{t.title}</span>
                  {t.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {t.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}

          {results.modules.length > 0 && (
            <div className="p-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Modules</p>
              {results.modules.map((m) => (
                <Link
                  key={m.id}
                  href={`/tracks/${m.trackId}`}
                  className="block px-2 py-1 rounded hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  <span className="font-medium">{m.title}</span>
                  {m.track && (
                    <p className="text-xs text-muted-foreground truncate">
                      {m.track.title}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
