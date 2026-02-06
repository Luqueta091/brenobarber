import { fromZonedTime } from "date-fns-tz";
import { env } from "../../../config/env.js";
import { dayBounds, getDiaSemana, applyTimeToDate, buildSlots, overlaps } from "../../../common/utils/date.js";
import { notFound, validationError } from "../../../common/errors/app-error.js";
import { disponibilidadeRepository } from "../repository/disponibilidade.repository.js";

export async function calcularDisponibilidade(params: {
  unidadeSlug: string;
  data: string;
  servicoId: string;
}) {
  const unidade = await disponibilidadeRepository.obterUnidadePorSlug(params.unidadeSlug);
  if (!unidade) {
    throw notFound("Unidade não encontrada");
  }

  const servico = await disponibilidadeRepository.obterServicoPorId(params.servicoId);
  if (!servico || !servico.ativo) {
    throw notFound("Serviço não encontrado ou inativo");
  }

  const timezone = env.APP_TIMEZONE;
  const day = fromZonedTime(`${params.data}T00:00:00`, timezone);

  const { start, end } = dayBounds(day, timezone);
  const diaSemana = getDiaSemana(day, timezone);

  const horarios = await disponibilidadeRepository.listarHorarios(unidade.id, diaSemana);
  if (horarios.length === 0) {
    return [];
  }

  const bloqueios = await disponibilidadeRepository.listarBloqueios(unidade.id, start, end);
  const agendamentos = await disponibilidadeRepository.listarAgendamentosAtivos(start, end);

  const slots = horarios.flatMap((horario) => {
    const inicio = applyTimeToDate(day, horario.horaInicio, timezone);
    const fim = applyTimeToDate(day, horario.horaFim, timezone);
    if (inicio >= fim) {
      return [];
    }
    return buildSlots(inicio, fim, servico.duracaoMinutos);
  });

  const livres = slots.filter((slot) => {
    const temBloqueio = bloqueios.some((bloqueio) =>
      overlaps(slot.inicio, slot.fim, bloqueio.inicioEm, bloqueio.fimEm)
    );
    if (temBloqueio) {
      return false;
    }
    const temAgendamento = agendamentos.some((agendamento) =>
      overlaps(slot.inicio, slot.fim, agendamento.inicioEm, agendamento.fimEm)
    );
    return !temAgendamento;
  });

  if (livres.length === 0) {
    return [];
  }

  return livres.map((slot) => ({
    inicioEm: slot.inicio.toISOString(),
    fimEm: slot.fim.toISOString()
  }));
}

export function validarData(data: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw validationError("data deve estar no formato YYYY-MM-DD");
  }
}
