// components/search.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useRef } from "react";

export function SearchBar() {
  const router = useRouter();
  const params = useSearchParams();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current && !ref.current.value && params.get("q")) {
      ref.current.value = params.get("q") || "";
    }
  }, [params]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = (new FormData(e.currentTarget).get("q") as string) || "";
    router.push(`/app/search${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg">
      <Input
        ref={ref}
        name="q"
        placeholder="Rechercher un parcours, un module…"
        className="w-full"
        aria-label="Rechercher"
      />
      <input type="submit" hidden />
    </form>
  );
}
