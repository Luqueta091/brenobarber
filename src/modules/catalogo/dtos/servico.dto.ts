import { z } from "zod";

export const criarServicoSchema = z.object({
  nome: z.string().min(1),
  duracaoMinutos: z.number().int().positive(),
  preco: z.number().min(0),
  ativo: z.boolean().optional()
});

export const atualizarServicoSchema = z.object({
  nome: z.string().min(1).optional(),
  duracaoMinutos: z.number().int().positive().optional(),
  preco: z.number().min(0).optional()
});

export const atualizarUnidadeSchema = z.object({
  nome: z.string().min(1)
});
