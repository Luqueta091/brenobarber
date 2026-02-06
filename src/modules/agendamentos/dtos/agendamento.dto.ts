import { z } from "zod";

export const criarAgendamentoSchema = z.object({
  unidadeSlug: z.string().min(1),
  servicoId: z.string().uuid(),
  inicioEm: z.string().datetime(),
  nome: z.string().min(1),
  telefone: z.string().min(8)
});

export const listarAgendamentosTelefoneSchema = z.object({
  telefone: z.string().min(8)
});

export const agendaDiaSchema = z.object({
  unidadeId: z.string().uuid(),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.string().optional()
});

export const agendaSemanaSchema = z.object({
  unidadeId: z.string().uuid(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
