import { prisma } from "../../../common/infrastructure/database/prisma-client.js";

export const catalogoRepository = {
  listarUnidades: () => prisma.unidade.findMany({ orderBy: { nome: "asc" } }),
  obterUnidadePorSlug: (slug: string) => prisma.unidade.findUnique({ where: { slug } }),
  listarServicosAtivos: () =>
    prisma.servico.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  listarServicos: async () => {
    const servicos = await prisma.servico.findMany({
      orderBy: { nome: "asc" },
      include: { _count: { select: { agendamentos: true } } }
    });
    return servicos.map(({ _count, ...servico }) => ({
      ...servico,
      temAgendamentos: _count.agendamentos > 0
    }));
  },
  atualizarUnidade: (id: string, data: { nome: string }) =>
    prisma.unidade.update({ where: { id }, data: { nome: data.nome } }),
  criarServico: (data: { nome: string; duracaoMinutos: number; preco: number; ativo?: boolean }) =>
    prisma.servico.create({
      data: {
        nome: data.nome,
        duracaoMinutos: data.duracaoMinutos,
        preco: data.preco,
        ativo: data.ativo ?? true
      }
    }),
  atualizarServico: (id: string, data: { nome?: string; duracaoMinutos?: number; preco?: number }) =>
    prisma.servico.update({ where: { id }, data }),
  definirAtivo: (id: string, ativo: boolean) =>
    prisma.servico.update({ where: { id }, data: { ativo } }),
  removerServico: (id: string) => prisma.servico.delete({ where: { id } }),
  contarAgendamentosPorServico: (id: string) =>
    prisma.agendamento.count({ where: { servicoId: id } })
};
