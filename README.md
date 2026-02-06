# Sistema de Agendamento — Barbeiro Único (2 Unidades)

Implementação V1 do sistema de agendamento público sem login + painel admin, com Postgres/Prisma e garantia de **zero sobreposição** via constraint.

## Requisitos
- Node.js 18+
- Postgres 13+
- npm

## Setup local
```bash
npm install
cp .env.example .env
# ajuste DATABASE_URL e ADMIN_TOKEN

npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Aplicação: http://localhost:3000

## Scripts
- `npm run dev` — dev server
- `npm run build` — build TS
- `npm run start` — start produção
- `npm run start:prod` — aplica migrations e inicia
- `npm run db:migrate:deploy` — migrations
- `npm run db:seed` — seed unidades/serviços
- `npm run test` — testes

## Variáveis de ambiente
- `DATABASE_URL`
- `ADMIN_TOKEN`
- `PORT`
- `APP_BASE_URL`
- `APP_TIMEZONE` (default: `America/Sao_Paulo`)
- `DATABASE_URL_TEST` (opcional) para testes de integração
  - (recomendado) base separada com migrations aplicadas

## API (resumo)

### Público
- `GET /public/unidades`
- `GET /public/unidades/:slug`
- `GET /public/servicos`
- `GET /public/disponibilidade?unidadeSlug=&data=YYYY-MM-DD&servicoId=`
- `POST /public/agendamentos`
  ```json
  {
    "unidadeSlug": "unidadeA",
    "servicoId": "uuid",
    "inicioEm": "2026-02-04T14:00:00-03:00",
    "nome": "Cliente",
    "telefone": "(11) 99999-9999"
  }
  ```
- `GET /public/agendamentos?telefone=`
- `POST /public/agendamentos/:id/cancelar`

### Admin (header `x-admin-token`)
- `GET /admin/servicos`
- `POST /admin/servicos`
- `PUT /admin/servicos/:id`
- `PATCH /admin/servicos/:id/ativar`
- `PATCH /admin/servicos/:id/desativar`
- `DELETE /admin/servicos/:id`
- `POST /admin/horarios-trabalho`
- `PUT /admin/horarios-trabalho/:id`
- `DELETE /admin/horarios-trabalho/:id`
- `GET /admin/horarios-trabalho?unidadeId=`
- `POST /admin/bloqueios`
- `DELETE /admin/bloqueios/:id`
- `GET /admin/bloqueios?inicioEm=&fimEm=&unidadeId=`
- `GET /admin/agenda/dia?unidadeId=&data=YYYY-MM-DD`
- `GET /admin/agenda/semana?unidadeId=&dataInicio=YYYY-MM-DD`
- `POST /admin/agendamentos/:id/cancelar`
- `POST /admin/agendamentos/:id/iniciar`
- `POST /admin/agendamentos/:id/concluir`
- `POST /admin/agendamentos/:id/falta`

### Resposta de erro (padrão)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dados inválidos",
    "details": {}
  },
  "requestId": "uuid"
}
```

## Banco de dados
- Migrations em `prisma/migrations`.
- Constraint de exclusão para zero sobreposição em `agendamento`.

## Deploy Railway
1. Crie projeto e Postgres.
2. Configure envs (`DATABASE_URL`, `ADMIN_TOKEN`, `PORT`, `APP_BASE_URL`).
3. Sete o comando de start como `npm run start:prod`.
4. Healthcheck: `GET /health`.

## Observações
- Horários de trabalho usam `dia_semana` (0=Domingo ... 6=Sábado).
- Telefone é normalizado para dígitos, com prefixo `55` quando possível.
- Disponibilidade é derivada (não persistida).
# brenobarber
