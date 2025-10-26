"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";

type TrackFiltersProps = {
  availableTags: string[];
};

export function TrackFilters({ availableTags }: TrackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // States synchronisés avec URLSearchParams
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [updatedAfter, setUpdatedAfter] = useState<Date | undefined>(
    searchParams.get("updatedAfter")
      ? new Date(searchParams.get("updatedAfter")!)
      : undefined
  );
  const [updatedBefore, setUpdatedBefore] = useState<Date | undefined>(
    searchParams.get("updatedBefore")
      ? new Date(searchParams.get("updatedBefore")!)
      : undefined
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.getAll("tags") ?? []
  );
  const [progress, setProgress] = useState<number[]>([
    Number(searchParams.get("progressMin") ?? 0),
    Number(searchParams.get("progressMax") ?? 100),
  ]);
  const [sort, setSort] = useState(
    searchParams.get("sort") ?? "updatedAt_desc"
  );

  // Debounced query
  const debouncedQ = useDebounce(q, 500);

  const resetFilters = () => {
    setQ("");
    setStatus("all");
    setUpdatedAfter(undefined);
    setUpdatedBefore(undefined);
    setSelectedTags([]);
    setProgress([0, 100]);
    setSort("updatedAt_desc");
    startTransition(() => {
      router.replace("?", { scroll: false });
    });
  };

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedQ) params.set("q", debouncedQ);
    if (status !== "all") params.set("status", status);
    if (updatedAfter) params.set("updatedAfter", updatedAfter.toISOString());
    if (updatedBefore) params.set("updatedBefore", updatedBefore.toISOString());
    selectedTags.forEach((t) => params.append("tags", t));
    params.set("progressMin", progress[0].toString());
    params.set("progressMax", progress[1].toString());
    params.set("sort", sort);

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }, [
    debouncedQ,
    status,
    updatedAfter,
    updatedBefore,
    selectedTags,
    progress,
    sort,
  ]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 items-end">
        <div className="col-span-2 relative">
          <Input
            placeholder="Rechercher un parcours..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pr-8"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="published">Publié</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !updatedAfter && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {updatedAfter
                ? format(updatedAfter, "P", { locale: fr })
                : "MAJ après..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0">
            <Calendar
              mode="single"
              selected={updatedAfter}
              onSelect={setUpdatedAfter}
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !updatedBefore && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {updatedBefore
                ? format(updatedBefore, "P", { locale: fr })
                : "MAJ avant..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="p-0">
            <Calendar
              mode="single"
              selected={updatedBefore}
              onSelect={setUpdatedBefore}
              locale={fr}
            />
          </PopoverContent>
        </Popover>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger>
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt_desc">MAJ récente</SelectItem>
            <SelectItem value="updatedAt_asc">MAJ ancienne</SelectItem>
            <SelectItem value="title_asc">Titre A–Z</SelectItem>
            <SelectItem value="title_desc">Titre Z–A</SelectItem>
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Progression</label>
          <Slider
            min={0}
            max={100}
            step={5}
            value={progress}
            onValueChange={setProgress}
          />
          <div className="text-xs text-muted-foreground">
            {progress[0]}% – {progress[1]}%
          </div>
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag}
              onClick={() => toggleTag(tag)}
              className={cn(
                "cursor-pointer select-none transition",
                selectedTags.includes(tag)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              )}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          disabled={isPending}
        >
          Réinitialiser les filtres
        </Button>
      </div>
    </div>
  );
}
