import type { Request, Response } from "express";
import { parse } from "../../../common/validation/validators.js";
import {
  agendaDiaSchema,
  agendaSemanaSchema,
  criarAgendamentoSchema,
  listarAgendamentosTelefoneSchema
} from "../dtos/agendamento.dto.js";
import {
  atualizarStatusAdmin,
  cancelarAgendamentoCliente,
  criarAgendamento,
  listarAgendaDia,
  listarAgendaSemana,
  listarAgendamentosPorTelefone
} from "../services/agendamentos.service.js";

export async function criarAgendamentoPublico(req: Request, res: Response) {
  const payload = parse(criarAgendamentoSchema, req.body);
  const agendamento = await criarAgendamento(payload);
  res.status(201).json({ data: agendamento });
}

export async function listarAgendamentosPublico(req: Request, res: Response) {
  const payload = parse(listarAgendamentosTelefoneSchema, req.query);
  const agendamentos = await listarAgendamentosPorTelefone(payload.telefone);
  res.json({ data: agendamentos });
}

export async function cancelarAgendamentoPublico(req: Request, res: Response) {
  const agendamento = await cancelarAgendamentoCliente(req.params.id);
  res.json({ data: agendamento });
}

export async function listarAgendaDiaAdmin(req: Request, res: Response) {
  const payload = parse(agendaDiaSchema, req.query);
  const agenda = await listarAgendaDia(payload);
  res.json({ data: agenda });
}

export async function listarAgendaSemanaAdmin(req: Request, res: Response) {
  const payload = parse(agendaSemanaSchema, req.query);
  const agenda = await listarAgendaSemana(payload);
  res.json({ data: agenda });
}

export async function cancelarAgendamentoAdmin(req: Request, res: Response) {
  const agendamento = await atualizarStatusAdmin(req.params.id, "CanceladoBarbeiro");
  res.json({ data: agendamento });
}

export async function iniciarAgendamentoAdmin(req: Request, res: Response) {
  const agendamento = await atualizarStatusAdmin(req.params.id, "EmAtendimento");
  res.json({ data: agendamento });
}

export async function concluirAgendamentoAdmin(req: Request, res: Response) {
  const agendamento = await atualizarStatusAdmin(req.params.id, "Concluido");
  res.json({ data: agendamento });
}

export async function faltaAgendamentoAdmin(req: Request, res: Response) {
  const agendamento = await atualizarStatusAdmin(req.params.id, "Falta");
  res.json({ data: agendamento });
}
