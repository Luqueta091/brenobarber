import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const unidadeA = await prisma.unidade.upsert({
    where: { slug: "unidadeA" },
    update: { nome: "Unidade A" },
    create: { slug: "unidadeA", nome: "Unidade A" }
  });

  const unidadeB = await prisma.unidade.upsert({
    where: { slug: "unidadeB" },
    update: { nome: "Unidade B" },
    create: { slug: "unidadeB", nome: "Unidade B" }
  });

  const servicos = await prisma.servico.count();
  if (servicos === 0) {
    await prisma.servico.createMany({
      data: [
        { nome: "Corte classico", duracaoMinutos: 30, preco: 50, ativo: true },
        { nome: "Barba completa", duracaoMinutos: 30, preco: 45, ativo: true },
        { nome: "Corte + barba", duracaoMinutos: 60, preco: 85, ativo: true }
      ]
    });
  }

  console.log("Seed concluido", { unidadeA: unidadeA.id, unidadeB: unidadeB.id });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
