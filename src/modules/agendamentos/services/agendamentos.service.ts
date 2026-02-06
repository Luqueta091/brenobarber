import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { Prisma, type AgendamentoStatus } from "@prisma/client";
import { env } from "../../../config/env.js";
import { conflict, notFound, validationError } from "../../../common/errors/app-error.js";
import { dayBounds, getDiaSemana, applyTimeToDate, overlaps } from "../../../common/utils/date.js";
import { normalizeTelefone } from "../../../common/utils/telefone.js";
import { agendamentosRepository } from "../repository/agendamentos.repository.js";
import { validarTransicao, statusesAtivos } from "../domain/status.js";

function parseDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw validationError("data inválida");
  }
  return date;
}

function buildDateFromYmd(value: string, timezone: string) {
  return fromZonedTime(`${value}T00:00:00`, timezone);
}

function slotDentroDeHorario(
  inicio: Date,
  fim: Date,
  diaBase: Date,
  timezone: string,
  horarios: { horaInicio: string | Date; horaFim: string | Date }[]
) {
  return horarios.some((horario) => {
    const janelaInicio = applyTimeToDate(diaBase, horario.horaInicio, timezone);
    const janelaFim = applyTimeToDate(diaBase, horario.horaFim, timezone);
    return inicio >= janelaInicio && fim <= janelaFim;
  });
}

export async function criarAgendamento(payload: {
  unidadeSlug: string;
  servicoId: string;
  inicioEm: string;
  nome: string;
  telefone: string;
}) {
  const unidade = await agendamentosRepository.obterUnidadePorSlug(payload.unidadeSlug);
  if (!unidade) {
    throw notFound("Unidade não encontrada");
  }

  const servico = await agendamentosRepository.obterServicoPorId(payload.servicoId);
  if (!servico || !servico.ativo) {
    throw notFound("Serviço não encontrado ou inativo");
  }

  const inicioEm = parseDate(payload.inicioEm);
  const fimEm = addMinutes(inicioEm, servico.duracaoMinutos);
  const timezone = env.APP_TIMEZONE;
  const diaSemana = getDiaSemana(inicioEm, timezone);

  const horarios = await agendamentosRepository.listarHorariosDia(unidade.id, diaSemana);
  if (horarios.length === 0) {
    throw validationError("Unidade não possui horários neste dia");
  }

  if (!slotDentroDeHorario(inicioEm, fimEm, inicioEm, timezone, horarios)) {
    throw validationError("Horário fora da janela de trabalho");
  }

  const bloqueios = await agendamentosRepository.listarBloqueios(unidade.id, inicioEm, fimEm);
  const conflitoBloqueio = bloqueios.some((bloqueio) =>
    overlaps(inicioEm, fimEm, bloqueio.inicioEm, bloqueio.fimEm)
  );
  if (conflitoBloqueio) {
    throw conflict("Horário indisponível por bloqueio");
  }

  const conflitos = await agendamentosRepository.listarAgendamentosAtivosNoIntervalo(
    inicioEm,
    fimEm
  );
  if (conflitos.length > 0) {
    throw conflict("Horário já ocupado");
  }

  const telefoneNormalizado = normalizeTelefone(payload.telefone);
  if (!telefoneNormalizado) {
    throw validationError("Telefone inválido");
  }

  try {
    const cliente = await agendamentosRepository.upsertCliente({
      nome: payload.nome,
      telefoneNormalizado
    });
    const agendamento = await agendamentosRepository.criarAgendamento({
      unidadeId: unidade.id,
      servicoId: servico.id,
      clienteId: cliente.id,
      inicioEm,
      fimEm
    });

    return agendamento;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2004" || String(error.message).includes("agendamento_sem_sobreposicao")) {
        throw conflict("Horário já ocupado");
      }
    }
    throw error;
  }
}

export async function listarAgendamentosPorTelefone(telefone: string) {
  const telefoneNormalizado = normalizeTelefone(telefone);
  if (!telefoneNormalizado) {
    throw validationError("Telefone inválido");
  }
  return agendamentosRepository.listarAgendamentosAtivosPorTelefone(telefoneNormalizado);
}

export async function cancelarAgendamentoCliente(id: string) {
  const agendamento = await agendamentosRepository.obterAgendamentoPorId(id);
  if (!agendamento) {
    throw notFound("Agendamento não encontrado");
  }
  if (agendamento.status !== "Confirmado") {
    throw validationError("Agendamento não pode ser cancelado");
  }
  return agendamentosRepository.atualizarStatus(id, "CanceladoCliente");
}

export async function atualizarStatusAdmin(id: string, status: "CanceladoBarbeiro" | "EmAtendimento" | "Concluido" | "Falta") {
  const agendamento = await agendamentosRepository.obterAgendamentoPorId(id);
  if (!agendamento) {
    throw notFound("Agendamento não encontrado");
  }
  validarTransicao(agendamento.status, status);
  return agendamentosRepository.atualizarStatus(id, status);
}

export async function listarAgendaDia(params: {
  unidadeId: string;
  data: string;
  status?: string;
}) {
  const timezone = env.APP_TIMEZONE;
  const day = buildDateFromYmd(params.data, timezone);
  const { start, end } = dayBounds(day, timezone);
  const statuses = params.status
    ? params.status
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s as AgendamentoStatus)
    : undefined;
  if (statuses) {
    const validos: AgendamentoStatus[] = [
      "Confirmado",
      "CanceladoCliente",
      "CanceladoBarbeiro",
      "EmAtendimento",
      "Concluido",
      "Falta"
    ];
    const invalidos = statuses.filter((status) => !validos.includes(status));
    if (invalidos.length > 0) {
      throw validationError("Status inválido", { invalidos });
    }
  }
  return agendamentosRepository.listarAgendaDia(params.unidadeId, start, end, statuses);
}

export async function listarAgendaSemana(params: { unidadeId: string; dataInicio: string }) {
  const timezone = env.APP_TIMEZONE;
  const startDay = buildDateFromYmd(params.dataInicio, timezone);
  const { start } = dayBounds(startDay, timezone);
  const end = addMinutes(start, 7 * 24 * 60);
  return agendamentosRepository.listarAgendaSemana(params.unidadeId, start, end);
}
