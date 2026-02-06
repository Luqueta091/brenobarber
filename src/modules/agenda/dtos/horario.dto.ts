import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/;

export const criarHorarioSchema = z.object({
  unidadeId: z.string().uuid(),
  diaSemana: z.number().int().min(0).max(6),
  horaInicio: z.string().regex(timeRegex),
  horaFim: z.string().regex(timeRegex),
  ativo: z.boolean().optional()
});

export const atualizarHorarioSchema = z.object({
  diaSemana: z.number().int().min(0).max(6).optional(),
  horaInicio: z.string().regex(timeRegex).optional(),
  horaFim: z.string().regex(timeRegex).optional(),
  ativo: z.boolean().optional()
});
