import { z } from "zod";

export const disponibilidadeQuerySchema = z.object({
  unidadeSlug: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  servicoId: z.string().uuid()
});
