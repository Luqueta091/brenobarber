import { prisma } from "../../../common/infrastructure/database/prisma-client.js";

const activeStatuses = ["Confirmado", "EmAtendimento"] as const;

export const disponibilidadeRepository = {
  obterUnidadePorSlug: (slug: string) => prisma.unidade.findUnique({ where: { slug } }),
  obterServicoPorId: (id: string) => prisma.servico.findUnique({ where: { id } }),
  listarHorarios: (unidadeId: string, diaSemana: number) =>
    prisma.horarioTrabalho.findMany({
      where: { unidadeId, diaSemana, ativo: true },
      orderBy: { horaInicio: "asc" }
    }),
  listarBloqueios: (unidadeId: string, inicioEm: Date, fimEm: Date) =>
    prisma.bloqueioAgenda.findMany({
      where: {
        inicioEm: { lt: fimEm },
        fimEm: { gt: inicioEm },
        OR: [{ unidadeId: null }, { unidadeId }]
      },
      orderBy: { inicioEm: "asc" }
    }),
  listarAgendamentosAtivos: (inicioEm: Date, fimEm: Date) =>
    prisma.agendamento.findMany({
      where: {
        inicioEm: { lt: fimEm },
        fimEm: { gt: inicioEm },
        status: { in: [...activeStatuses] }
      },
      orderBy: { inicioEm: "asc" }
    })
};

export type ActiveStatus = (typeof activeStatuses)[number];
