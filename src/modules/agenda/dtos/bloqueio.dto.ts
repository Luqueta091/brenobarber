import { z } from "zod";

export const criarBloqueioSchema = z.object({
  inicioEm: z.string().datetime(),
  fimEm: z.string().datetime(),
  motivo: z.string().min(1).optional(),
  unidadeId: z.string().uuid().optional().nullable()
});

export const listarBloqueiosSchema = z.object({
  inicioEm: z.string().datetime(),
  fimEm: z.string().datetime(),
  unidadeId: z.string().uuid().optional().nullable()
});
