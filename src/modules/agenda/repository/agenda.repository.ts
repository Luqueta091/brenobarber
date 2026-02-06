import { prisma } from "../../../common/infrastructure/database/prisma-client.js";

export const agendaRepository = {
  criarHorario: (data: {
    unidadeId: string;
    diaSemana: number;
    horaInicio: Date;
    horaFim: Date;
    ativo?: boolean;
  }) =>
    prisma.horarioTrabalho.create({
      data: {
        unidadeId: data.unidadeId,
        diaSemana: data.diaSemana,
        horaInicio: data.horaInicio,
        horaFim: data.horaFim,
        ativo: data.ativo ?? true
      }
    }),
  atualizarHorario: (
    id: string,
    data: Partial<{ diaSemana: number; horaInicio: Date; horaFim: Date; ativo: boolean }>
  ) =>
    prisma.horarioTrabalho.update({ where: { id }, data }),
  removerHorario: (id: string) => prisma.horarioTrabalho.delete({ where: { id } }),
  listarHorariosPorUnidade: (unidadeId: string) =>
    prisma.horarioTrabalho.findMany({
      where: { unidadeId },
      orderBy: [{ diaSemana: "asc" }, { horaInicio: "asc" }]
    }),
  criarBloqueio: (data: { inicioEm: Date; fimEm: Date; motivo?: string; unidadeId?: string | null }) =>
    prisma.bloqueioAgenda.create({
      data: {
        inicioEm: data.inicioEm,
        fimEm: data.fimEm,
        motivo: data.motivo,
        unidadeId: data.unidadeId ?? null
      }
    }),
  removerBloqueio: (id: string) => prisma.bloqueioAgenda.delete({ where: { id } }),
  listarBloqueios: (intervalo: { inicioEm: Date; fimEm: Date; unidadeId?: string | null }) => {
    const unidadeId = intervalo.unidadeId;
    const unidadeFiltro = unidadeId
      ? { OR: [{ unidadeId: null }, { unidadeId }] }
      : {};
    return prisma.bloqueioAgenda.findMany({
      where: {
        inicioEm: { lt: intervalo.fimEm },
        fimEm: { gt: intervalo.inicioEm },
        ...unidadeFiltro
      },
      orderBy: { inicioEm: "asc" }
    });
  }
};
