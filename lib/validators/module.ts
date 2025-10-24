// /lib/validators/module.ts
import { z } from "zod";

export const ModuleStatusEnum = z.enum(["todo", "in_progress", "done"]);

export const createModuleSchema = z.object({
  trackId: z.string().min(1, "trackId requis"),
  title: z
    .string()
    .min(1, "Titre requis")
    .max(160, "Titre trop long (max 160)")
    .trim(),
  externalUrl: z
    .string()
    .url("URL invalide")
    .max(2048, "URL trop longue")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  dueDate: z
    .string()
    .datetime({ offset: true })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: ModuleStatusEnum.default("todo"),
});

export const updateModuleSchema = createModuleSchema.extend({
  id: z.string().min(1, "id requis"),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
