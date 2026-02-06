import { type AgendamentoStatus } from "@prisma/client";
import { prisma } from "../../../common/infrastructure/database/prisma-client.js";
import { statusesAtivos } from "../domain/status.js";

export const agendamentosRepository = {
  obterUnidadePorSlug: (slug: string) => prisma.unidade.findUnique({ where: { slug } }),
  obterServicoPorId: (id: string) => prisma.servico.findUnique({ where: { id } }),
  listarHorariosDia: (unidadeId: string, diaSemana: number) =>
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
      }
    }),
  listarAgendamentosAtivosNoIntervalo: (inicioEm: Date, fimEm: Date) =>
    prisma.agendamento.findMany({
      where: {
        inicioEm: { lt: fimEm },
        fimEm: { gt: inicioEm },
        status: { in: statusesAtivos }
      }
    }),
  upsertCliente: (data: { nome: string; telefoneNormalizado: string }) =>
    prisma.cliente.upsert({
      where: { telefoneNormalizado: data.telefoneNormalizado },
      update: { nome: data.nome },
      create: { nome: data.nome, telefoneNormalizado: data.telefoneNormalizado }
    }),
  criarAgendamento: (data: {
    unidadeId: string;
    servicoId: string;
    clienteId: string;
    inicioEm: Date;
    fimEm: Date;
  }) =>
    prisma.agendamento.create({
      data: {
        unidadeId: data.unidadeId,
        servicoId: data.servicoId,
        clienteId: data.clienteId,
        inicioEm: data.inicioEm,
        fimEm: data.fimEm,
        status: "Confirmado"
      },
      include: {
        servico: true,
        unidade: true,
        cliente: true
      }
    }),
  listarAgendamentosAtivosPorTelefone: (telefoneNormalizado: string) =>
    prisma.agendamento.findMany({
      where: {
        cliente: { telefoneNormalizado },
        status: { in: statusesAtivos }
      },
      include: { servico: true, unidade: true },
      orderBy: { inicioEm: "asc" }
    }),
  obterAgendamentoPorId: (id: string) =>
    prisma.agendamento.findUnique({ where: { id } }),
  atualizarStatus: (id: string, status: AgendamentoStatus) =>
    prisma.agendamento.update({ where: { id }, data: { status } }),
  listarAgendaDia: (
    unidadeId: string,
    inicioEm: Date,
    fimEm: Date,
    statuses?: AgendamentoStatus[]
  ) =>
    prisma.agendamento.findMany({
      where: {
        unidadeId,
        inicioEm: { lt: fimEm },
        fimEm: { gt: inicioEm },
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {})
      },
      include: { servico: true, cliente: true },
      orderBy: { inicioEm: "asc" }
    }),
  listarAgendaSemana: (unidadeId: string, inicioEm: Date, fimEm: Date) =>
    prisma.agendamento.findMany({
      where: {
        unidadeId,
        inicioEm: { lt: fimEm },
        fimEm: { gt: inicioEm }
      },
      include: { servico: true, cliente: true },
      orderBy: { inicioEm: "asc" }
    })
};
