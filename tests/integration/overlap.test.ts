import { describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL_TEST;

const describeIf = databaseUrl ? describe : describe.skip;

describeIf("overlap constraint", () => {
  const prisma = new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  });

  it("impede dois agendamentos no mesmo horario", async () => {
    const unidade = await prisma.unidade.create({
      data: { slug: `unidade-test-${Date.now()}`, nome: "Unidade Test" }
    });
    const servico = await prisma.servico.create({
      data: { nome: "Teste", duracaoMinutos: 30, preco: 10, ativo: true }
    });
    const cliente = await prisma.cliente.create({
      data: { nome: "Cliente", telefoneNormalizado: `55119999${Date.now()}` }
    });

    const inicioEm = new Date("2026-02-04T10:00:00Z");
    const fimEm = new Date("2026-02-04T10:30:00Z");

    await prisma.agendamento.create({
      data: {
        unidadeId: unidade.id,
        servicoId: servico.id,
        clienteId: cliente.id,
        inicioEm,
        fimEm,
        status: "Confirmado"
      }
    });

    await expect(
      prisma.agendamento.create({
        data: {
          unidadeId: unidade.id,
          servicoId: servico.id,
          clienteId: cliente.id,
          inicioEm,
          fimEm,
          status: "Confirmado"
        }
      })
    ).rejects.toThrow();
  });
});
