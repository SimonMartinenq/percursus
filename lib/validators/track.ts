// lib/validators/track.ts
import { z } from "zod";

export const trackStatusEnum = z.enum(["draft", "published"]);

// Règles pour un nom de tag : trim, longueur, charset simple
export const tagNameSchema = z
  .string()
  .trim()
  .min(1, "Le tag ne peut pas être vide")
  .max(30, "30 caractères max")
  .regex(
    /^[\p{L}\p{N}\s\-_]+$/u,
    "Caractères autorisés : lettres, chiffres, espaces, - et _"
  );

// Tableau de tags avec unicité
export const tagsArraySchema = z
  .array(tagNameSchema)
  .max(20, "Maximum 20 tags")
  .transform((arr) => {
    const uniq = Array.from(new Set(arr.map((t) => t.trim()))).filter(Boolean);
    return uniq;
  });

export const trackCreateSchema = z.object({
  title: z.string().min(3, "Au moins 3 caractères").max(120),
  description: z.string().max(5000).optional().or(z.literal("")),
  goals: z.string().max(5000).optional().or(z.literal("")),
  status: trackStatusEnum.default("draft"),
  // tags peut venir sous 2 formes :
  //  - tableau déjà parsé
  //  - string JSON (cas FormData) -> on parse puis on valide
  tags: z
    .union([
      tagsArraySchema,
      z.string().transform((s) => {
        try {
          return JSON.parse(s || "[]");
        } catch {
          return [];
        }
      }),
    ])
    .optional()
    .transform((v) => (Array.isArray(v) ? v : []))
    .pipe(tagsArraySchema.optional().default([])),
});

export const trackUpdateSchema = trackCreateSchema.partial().extend({
  id: z.string().cuid("ID invalide"),
  // On autorise explicitement tags dans l'update (même logique que create)
  tags: trackCreateSchema.shape.tags.optional(),
});
