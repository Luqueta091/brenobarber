CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agendamento_status') THEN
    CREATE TYPE "agendamento_status" AS ENUM (
      'Confirmado',
      'CanceladoCliente',
      'CanceladoBarbeiro',
      'EmAtendimento',
      'Concluido',
      'Falta'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "unidade" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL,
  "nome" text NOT NULL,
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "unidade_slug_unique" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "servico" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome" text NOT NULL,
  "duracao_minutos" integer NOT NULL,
  "preco" numeric(10, 2) NOT NULL,
  "ativo" boolean NOT NULL DEFAULT true,
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "servico_duracao_positive" CHECK ("duracao_minutos" > 0),
  CONSTRAINT "servico_preco_nonnegative" CHECK ("preco" >= 0)
);

CREATE TABLE IF NOT EXISTS "horario_trabalho" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "unidade_id" uuid NOT NULL REFERENCES "unidade"("id") ON DELETE CASCADE,
  "dia_semana" integer NOT NULL,
  "hora_inicio" time NOT NULL,
  "hora_fim" time NOT NULL,
  "ativo" boolean NOT NULL DEFAULT true,
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "horario_trabalho_dia_valido" CHECK ("dia_semana" BETWEEN 0 AND 6),
  CONSTRAINT "horario_trabalho_hora_valida" CHECK ("hora_inicio" < "hora_fim")
);

CREATE TABLE IF NOT EXISTS "bloqueio_agenda" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "inicio_em" timestamptz NOT NULL,
  "fim_em" timestamptz NOT NULL,
  "motivo" text,
  "unidade_id" uuid REFERENCES "unidade"("id") ON DELETE SET NULL,
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "bloqueio_agenda_intervalo_valido" CHECK ("inicio_em" < "fim_em")
);

CREATE TABLE IF NOT EXISTS "cliente" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "nome" text NOT NULL,
  "telefone_normalizado" text NOT NULL,
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "cliente_telefone_unique" UNIQUE ("telefone_normalizado")
);

CREATE TABLE IF NOT EXISTS "agendamento" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "unidade_id" uuid NOT NULL REFERENCES "unidade"("id") ON DELETE CASCADE,
  "servico_id" uuid NOT NULL REFERENCES "servico"("id"),
  "cliente_id" uuid NOT NULL REFERENCES "cliente"("id"),
  "inicio_em" timestamptz NOT NULL,
  "fim_em" timestamptz NOT NULL,
  "status" agendamento_status NOT NULL DEFAULT 'Confirmado',
  "criado_em" timestamptz NOT NULL DEFAULT now(),
  "atualizado_em" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "agendamento_intervalo_valido" CHECK ("inicio_em" < "fim_em")
);

CREATE INDEX IF NOT EXISTS "idx_servico_ativo" ON "servico"("ativo");
CREATE INDEX IF NOT EXISTS "idx_horario_trabalho_unidade_dia" ON "horario_trabalho"("unidade_id", "dia_semana");
CREATE INDEX IF NOT EXISTS "idx_bloqueio_inicio" ON "bloqueio_agenda"("inicio_em");
CREATE INDEX IF NOT EXISTS "idx_bloqueio_fim" ON "bloqueio_agenda"("fim_em");
CREATE INDEX IF NOT EXISTS "idx_bloqueio_unidade" ON "bloqueio_agenda"("unidade_id");
CREATE INDEX IF NOT EXISTS "idx_cliente_telefone" ON "cliente"("telefone_normalizado");
CREATE INDEX IF NOT EXISTS "idx_agendamento_inicio" ON "agendamento"("inicio_em");
CREATE INDEX IF NOT EXISTS "idx_agendamento_status" ON "agendamento"("status");
CREATE INDEX IF NOT EXISTS "idx_agendamento_unidade_inicio" ON "agendamento"("unidade_id", "inicio_em");
CREATE INDEX IF NOT EXISTS "idx_agendamento_cliente_inicio" ON "agendamento"("cliente_id", "inicio_em");

ALTER TABLE "agendamento"
ADD CONSTRAINT "agendamento_sem_sobreposicao"
EXCLUDE USING gist (
  tstzrange("inicio_em", "fim_em", '[)') WITH &&
)
WHERE ("status" IN ('Confirmado', 'EmAtendimento'));
