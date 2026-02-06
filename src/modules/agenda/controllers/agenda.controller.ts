import type { Request, Response } from "express";
import { parse } from "../../../common/validation/validators.js";
import { validationError } from "../../../common/errors/app-error.js";
import { criarHorarioSchema, atualizarHorarioSchema } from "../dtos/horario.dto.js";
import { criarBloqueioSchema, listarBloqueiosSchema } from "../dtos/bloqueio.dto.js";
import { agendaRepository } from "../repository/agenda.repository.js";

function timeToMinutes(time: string) {
  const [h, m, s = "0"] = time.split(":");
  return Number(h) * 60 + Number(m) + Number(s) / 60;
}

function timeToDate(time: string) {
  const [h = "00", m = "00", s = "00"] = time.split(":");
  const hh = h.padStart(2, "0");
  const mm = m.padStart(2, "0");
  const ss = s.padStart(2, "0");
  return new Date(`1970-01-01T${hh}:${mm}:${ss}Z`);
}

function formatTime(value: Date) {
  return value.toISOString().slice(11, 16);
}

export async function criarHorario(req: Request, res: Response) {
  const payload = parse(criarHorarioSchema, req.body);
  if (timeToMinutes(payload.horaInicio) >= timeToMinutes(payload.horaFim)) {
    throw validationError("hora_inicio deve ser menor que hora_fim");
  }
  const horario = await agendaRepository.criarHorario({
    ...payload,
    horaInicio: timeToDate(payload.horaInicio),
    horaFim: timeToDate(payload.horaFim)
  });
  res.status(201).json({ data: horario });
}

export async function atualizarHorario(req: Request, res: Response) {
  const payload = parse(atualizarHorarioSchema, req.body);
  if (
    payload.horaInicio &&
    payload.horaFim &&
    timeToMinutes(payload.horaInicio) >= timeToMinutes(payload.horaFim)
  ) {
    throw validationError("hora_inicio deve ser menor que hora_fim");
  }
  const data: Partial<{
    diaSemana: number;
    horaInicio: Date;
    horaFim: Date;
    ativo: boolean;
  }> = {
    diaSemana: payload.diaSemana,
    ativo: payload.ativo
  };

  if (payload.horaInicio) {
    data.horaInicio = timeToDate(payload.horaInicio);
  }

  if (payload.horaFim) {
    data.horaFim = timeToDate(payload.horaFim);
  }
  const horario = await agendaRepository.atualizarHorario(req.params.id, data);
  res.json({ data: horario });
}

export async function listarHorarios(req: Request, res: Response) {
  const unidadeId = req.query.unidadeId;
  if (typeof unidadeId !== "string") {
    throw validationError("unidadeId é obrigatório");
  }
  const horarios = await agendaRepository.listarHorariosPorUnidade(unidadeId);
  const output = horarios.map((horario) => ({
    ...horario,
    horaInicio: formatTime(horario.horaInicio),
    horaFim: formatTime(horario.horaFim)
  }));
  res.json({ data: output });
}

export async function removerHorario(req: Request, res: Response) {
  const horario = await agendaRepository.removerHorario(req.params.id);
  res.json({ data: horario });
}

export async function criarBloqueio(req: Request, res: Response) {
  const payload = parse(criarBloqueioSchema, req.body);
  const inicioEm = new Date(payload.inicioEm);
  const fimEm = new Date(payload.fimEm);
  if (inicioEm >= fimEm) {
    throw validationError("inicio_em deve ser menor que fim_em");
  }
  const bloqueio = await agendaRepository.criarBloqueio({
    inicioEm,
    fimEm,
    motivo: payload.motivo,
    unidadeId: payload.unidadeId ?? null
  });
  res.status(201).json({ data: bloqueio });
}

export async function removerBloqueio(req: Request, res: Response) {
  const bloqueio = await agendaRepository.removerBloqueio(req.params.id);
  res.json({ data: bloqueio });
}

export async function listarBloqueios(req: Request, res: Response) {
  const payload = parse(listarBloqueiosSchema, req.query);
  const bloqueios = await agendaRepository.listarBloqueios({
    inicioEm: new Date(payload.inicioEm),
    fimEm: new Date(payload.fimEm),
    unidadeId: payload.unidadeId ?? null
  });
  res.json({ data: bloqueios });
}
