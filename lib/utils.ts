import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeProgress(track: { modules: { status: string }[] }) {
  const total = track.modules.length;
  if (total === 0) return 0;
  const done = track.modules.filter((m) => m.status === "done").length;
  return Math.round((done / total) * 100);
}
