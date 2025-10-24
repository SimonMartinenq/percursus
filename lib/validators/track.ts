//validators/track.ts
import { z } from "zod";

export const trackStatusEnum = z.enum(["draft", "published"]);

export const trackCreateSchema = z.object({
  title: z.string().min(3, "Au moins 3 caractères").max(120),
  description: z.string().max(5000).optional().or(z.literal("")),
  goals: z.string().max(5000).optional().or(z.literal("")),
  status: trackStatusEnum.default("draft"),
});

export const trackUpdateSchema = trackCreateSchema.partial().extend({
  id: z.string().cuid("ID invalide"),
});
