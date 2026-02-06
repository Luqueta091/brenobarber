import { describe, expect, it, beforeAll, afterAll } from "vitest";
import request from "supertest";

const databaseUrl = process.env.DATABASE_URL_TEST;

const describeIf = databaseUrl ? describe : describe.skip;

describeIf("public flow", () => {
  let app: import("express").Express;
  let prisma: import("@prisma/client").PrismaClient;
  let unidadeId: string;
  let servicoId: string;
  let unidadeSlug: string;
  let dbAvailable = false;

  beforeAll(async () => {
    process.env.DATABASE_URL = databaseUrl;
    process.env.ADMIN_TOKEN = "test-token";
    process.env.APP_BASE_URL = "http://localhost";
    process.env.APP_TIMEZONE = "UTC";

    const [{ createServer }, prismaModule] = await Promise.all([
      import("../../src/common/infrastructure/http/server.js"),
      import("@prisma/client")
    ]);

    app = createServer();
    prisma = new prismaModule.PrismaClient({
      datasources: { db: { url: databaseUrl } }
    });

    try {
      await prisma.$connect();
      dbAvailable = true;
    } catch (error) {
      console.warn("Skipping e2e: database not reachable");
      dbAvailable = false;
      await prisma.$disconnect().catch(() => {});
      return;
    }

    unidadeSlug = `unidade-test-${Date.now()}`;
    const unidade = await prisma.unidade.create({
      data: { slug: unidadeSlug, nome: "Unidade Test" }
    });
    unidadeId = unidade.id;

    const servico = await prisma.servico.create({
      data: { nome: "Servico Test", duracaoMinutos: 30, preco: 10, ativo: true }
    });
    servicoId = servico.id;

    const today = new Date();
    const diaSemana = today.getUTCDay();
    await prisma.horarioTrabalho.create({
      data: {
        unidadeId,
        diaSemana,
        horaInicio: new Date("1970-01-01T09:00:00Z"),
        horaFim: new Date("1970-01-01T11:00:00Z"),
        ativo: true
      }
    });
  });

  afterAll(async () => {
    if (prisma && dbAvailable) {
      await prisma.agendamento.deleteMany({
        where: { unidadeId }
      });
      await prisma.cliente.deleteMany({
        where: { telefoneNormalizado: "5511999990000" }
      });
      await prisma.horarioTrabalho.deleteMany({ where: { unidadeId } });
      await prisma.servico.deleteMany({ where: { id: servicoId } });
      await prisma.unidade.deleteMany({ where: { id: unidadeId } });
      await prisma.$disconnect();
    }
  });

  it("cria, lista e cancela agendamento", async () => {
    if (!dbAvailable) {
      return;
    }
    const data = new Date().toISOString().slice(0, 10);
    const slotsRes = await request(app).get(
      `/public/disponibilidade?unidadeSlug=${unidadeSlug}&data=${data}&servicoId=${servicoId}`
    );
    expect(slotsRes.status).toBe(200);
    const slots = slotsRes.body.data;
    expect(slots.length).toBeGreaterThan(0);

    const inicioEm = slots[0].inicioEm;
    const createRes = await request(app)
      .post("/public/agendamentos")
      .send({
        unidadeSlug,
        servicoId,
        inicioEm,
        nome: "Cliente Test",
        telefone: "11999990000"
      });
    expect(createRes.status).toBe(201);

    const listRes = await request(app).get("/public/agendamentos?telefone=11999990000");
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const agendamentoId = listRes.body.data[0].id;
    const cancelRes = await request(app).post(`/public/agendamentos/${agendamentoId}/cancelar`);
    expect(cancelRes.status).toBe(200);
  });
});
