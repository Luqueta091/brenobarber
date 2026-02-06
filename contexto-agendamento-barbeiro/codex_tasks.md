# Plano de Tasks — Do zero até a entrega (V1) ✅
> Objetivo: entregar um sistema de agendamento com 2 unidades, público sem login (nome+telefone), admin para gestão (serviços, horários, bloqueios, agenda) e **garantia de zero sobreposição** no banco.

---

## Definition of Done (DoD) — Regra do jogo
- [ ] Setup do projeto reproduzível (`README` com passos, `.env.example`, scripts)
- [ ] Banco Postgres com migrations + seed (2 unidades)
- [ ] Regra de **zero sobreposição** garantida no Postgres (constraint)
- [ ] API documentada (rotas + exemplos)
- [ ] Fluxo público completo: escolher unidade → serviço → horário → confirmar → visualizar/cancelar por telefone
- [ ] Fluxo admin completo: CRUD serviços → horários → bloqueios → agenda dia/semana → operar status
- [ ] Testes cobrindo casos críticos (conflito de horário, bloqueios, status)
- [ ] Deploy no Railway com migrations aplicadas automaticamente
- [ ] Logs/erros minimamente observáveis (request-id + error handler)
- [ ] Entrega final com checklist + validação em ambiente staging/produção

---

## EPIC 00 — Kickoff e fundação do repositório
- [ ] Criar repositório e padrões (branching, commits, PR)
- [ ] Configurar lint/format (mínimo) + scripts padrão
- [ ] Criar `.env.example` com todas as variáveis necessárias
- [ ] Criar `README.md` com:
  - [ ] requisitos
  - [ ] setup local
  - [ ] rodar migrations/seed
  - [ ] rodar testes
  - [ ] deploy (Railway)
- [ ] Estruturar pastas conforme arquitetura:
  - [ ] `src/common/*`
  - [ ] `src/modules/{catalogo,agenda,agendamentos,disponibilidade}/*`
  - [ ] `prisma/*` (schema, migrations, seed)
  - [ ] `tests/*` (unit/integration/e2e)

**Saída:** base do projeto pronta pra implementar sem virar bagunça.

---

## EPIC 01 — Banco de Dados (Postgres) + Prisma (migrations/seed)
- [ ] Modelar schema no Prisma (entidades):
  - [ ] `Unidade (slug, nome)`
  - [ ] `Servico (nome, duracao_minutos, preco, ativo)`
  - [ ] `HorarioTrabalho (unidade_id, dia_semana, hora_inicio, hora_fim, ativo)`
  - [ ] `BloqueioAgenda (inicio_em, fim_em, motivo, unidade_id opcional)`
  - [ ] `Cliente (nome, telefone_normalizado, criado_em)`
  - [ ] `Agendamento (unidade_id, servico_id, cliente_id, inicio_em, fim_em, status, criado_em)`
- [ ] Criar índices e checks importantes:
  - [ ] `unidade.slug` UNIQUE
  - [ ] `cliente.telefone_normalizado` UNIQUE (+ index)
  - [ ] indexes por busca: agenda por data/unidade/status
  - [ ] checks de integridade: `inicio_em < fim_em`, `duracao > 0`, etc.
- [ ] Criar migration SQL manual para **garantia de zero sobreposição**:
  - [ ] habilitar extensão `btree_gist` (se necessário)
  - [ ] criar `EXCLUDE USING gist (tstzrange(inicio_em, fim_em,'[)') WITH &&) WHERE status IN (...)`
- [ ] Seed inicial:
  - [ ] inserir `Unidade A` e `Unidade B` com slugs fixos
  - [ ] (opcional) inserir 3–5 serviços exemplo
- [ ] Criar cliente Prisma compartilhado em `src/common/infrastructure/database/*`

**Aceite:** criar agendamento concorrente no mesmo intervalo falha no banco (não só na API).

---

## EPIC 02 — Infra comum (HTTP, erros, validação, auth admin)
- [ ] Server HTTP + router central (`src/common/infrastructure/http/*`)
- [ ] Middleware `request-id` + logger de request (mínimo)
- [ ] Error handler padrão (mapeia erro de domínio → HTTP)
- [ ] Validação de entrada (DTOs):
  - [ ] schemas para requests públicos
  - [ ] schemas para requests admin
- [ ] Admin auth (V1 pragmático):
  - [ ] middleware `admin-auth` via token/segredo em header
  - [ ] negar rotas admin sem credencial
- [ ] Config de env centralizada (`env.ts`), falha rápida se variável faltar

**Aceite:** qualquer erro vira resposta consistente; admin não fica aberto.

---

## EPIC 03 — MOD-001 Catálogo (Unidades + Serviços)
### Unidades (público)
- [ ] Endpoint: listar unidades (ou resolver unidade por slug)
- [ ] Endpoint: obter unidade por `slug` (para página `/unidadeA`, `/unidadeB`)
- [ ] Repositório + mappers

### Serviços
- [ ] Endpoint público: listar serviços **ativos**
- [ ] Admin CRUD:
  - [ ] criar serviço
  - [ ] editar serviço
  - [ ] ativar/desativar serviço
  - [ ] listar todos (admin)
- [ ] Regras:
  - [ ] `duracao_minutos > 0`
  - [ ] preço >= 0
- [ ] Testes (unit + integration) do CRUD e listagem de ativos

**Aceite:** público só enxerga ativos; admin controla catálogo.

---

## EPIC 04 — MOD-002 Agenda (Horários de trabalho + Bloqueios)
### Horários de trabalho (admin)
- [ ] Criar/editar horários por unidade e dia da semana
- [ ] Permitir múltiplas janelas no mesmo dia (ex.: manhã/tarde)
- [ ] Listar horários por unidade
- [ ] Validações:
  - [ ] `dia_semana` válido
  - [ ] `hora_inicio < hora_fim`
  - [ ] (opcional V1) evitar sobreposição entre janelas do mesmo dia

### Bloqueios (admin)
- [ ] Criar bloqueio:
  - [ ] global (`unidade_id` null) ou por unidade
- [ ] Remover bloqueio
- [ ] Listar bloqueios por intervalo/unidade
- [ ] Validações:
  - [ ] `inicio_em < fim_em`
- [ ] Testes: bloqueio global afetando as duas unidades

**Aceite:** admin consegue “fechar” intervalos e configurar agenda semanal.

---

## EPIC 05 — MOD-004 Disponibilidade (slots derivados)
- [ ] Endpoint público: consultar disponibilidade por:
  - [ ] unidade (slug/id)
  - [ ] data (dia)
  - [ ] serviço (duração)
- [ ] Implementar cálculo:
  - [ ] carregar `HorariosTrabalho` do dia
  - [ ] carregar `Bloqueios` (globais + da unidade)
  - [ ] carregar `Agendamentos ativos` no intervalo
  - [ ] gerar slots respeitando duração do serviço
  - [ ] remover slots que colidem com bloqueios/agendamentos
- [ ] Regras:
  - [ ] disponibilidade **não é persistida**
  - [ ] agendamento ativo = status em conjunto permitido (ex.: Confirmado/EmAtendimento)
- [ ] Testes unitários do gerador de slots:
  - [ ] dia sem janelas → vazio
  - [ ] bloqueio parcial removendo slots
  - [ ] agendamento ativo removendo slots
  - [ ] duração do serviço alterando o grid

**Aceite:** consultar disponibilidade retorna apenas horários realmente reserváveis.

---

## EPIC 06 — MOD-003 Agendamentos (clientes + agendamento + ciclo de vida)
### Cliente (público)
- [ ] Normalização de telefone (armazenar `telefone_normalizado`)
- [ ] `upsert` de cliente por telefone

### Criar agendamento (público)
- [ ] Endpoint: criar agendamento com:
  - [ ] unidade
  - [ ] serviço
  - [ ] inicio_em
  - [ ] nome + telefone
- [ ] Regras hard:
  - [ ] calcular `fim_em` via duração do serviço
  - [ ] impedir criação fora do horário de trabalho
  - [ ] impedir criação em bloqueio (global/unidade)
  - [ ] impedir sobreposição via:
    - [ ] validação no service (pré-check)
    - [ ] constraint no banco (garantia final)
- [ ] Status inicial: `Confirmado`

### Gerenciar por telefone (público)
- [ ] Endpoint: listar agendamentos **ativos** por telefone (normalizado)
- [ ] Endpoint: cancelar por cliente (somente se status permitir)

### Admin — Operação da agenda
- [ ] Endpoint: listar agenda do dia (por unidade) + filtros por status
- [ ] Endpoint: listar agenda da semana (por unidade)
- [ ] Ações admin:
  - [ ] cancelar (CanceladoBarbeiro)
  - [ ] iniciar atendimento (EmAtendimento)
  - [ ] concluir (Concluido)
  - [ ] marcar falta (Falta)

### Transições de status (regras)
- [ ] Implementar validação de transição:
  - [ ] Confirmado → EmAtendimento
  - [ ] EmAtendimento → Concluido
  - [ ] Confirmado → CanceladoCliente/CanceladoBarbeiro
  - [ ] Confirmado → Falta (se admin decidir)
  - [ ] bloquear transições inválidas
- [ ] Testes críticos:
  - [ ] concorrência (duas reservas no mesmo horário)
  - [ ] cancelamento altera disponibilidade
  - [ ] transições inválidas retornam erro

**Aceite:** ciclo completo funciona e não cria conflito nem com corrida.

---

## EPIC 07 — Camada HTTP (rotas) e contratos finais
- [ ] Rotas públicas:
  - [ ] `GET /public/unidades`
  - [ ] `GET /public/unidades/:slug`
  - [ ] `GET /public/servicos`
  - [ ] `GET /public/disponibilidade?unidadeSlug=&data=&servicoId=`
  - [ ] `POST /public/agendamentos`
  - [ ] `GET /public/agendamentos?telefone=`
  - [ ] `POST /public/agendamentos/:id/cancelar`
- [ ] Rotas admin (protegidas):
  - [ ] `POST/PUT/PATCH/GET /admin/servicos`
  - [ ] `POST/PUT/GET /admin/horarios-trabalho`
  - [ ] `POST/DELETE/GET /admin/bloqueios`
  - [ ] `GET /admin/agenda/dia`
  - [ ] `GET /admin/agenda/semana`
  - [ ] `POST /admin/agendamentos/:id/cancelar`
  - [ ] `POST /admin/agendamentos/:id/iniciar`
  - [ ] `POST /admin/agendamentos/:id/concluir`
  - [ ] `POST /admin/agendamentos/:id/falta`
- [ ] Padronizar response/error shape
- [ ] Versionamento (opcional): prefixo `/v1`

**Aceite:** API navegável e consistente.

---

## EPIC 08 — Frontend Público (UX essencial)
> Se o projeto for fullstack no mesmo repo, aqui entra a UI; se for separado, vira outro pacote, mas as tasks são iguais.

- [ ] Página `/unidadeA` e `/unidadeB`:
  - [ ] resolver unidade por slug
  - [ ] listar serviços ativos
  - [ ] selecionar serviço
  - [ ] selecionar data
  - [ ] consultar disponibilidade (slots)
  - [ ] selecionar horário
  - [ ] confirmar com nome+telefone
- [ ] Tela de confirmação:
  - [ ] mostrar resumo (unidade, serviço, data/hora)
  - [ ] CTA: “ver meus agendamentos”
- [ ] “Meus agendamentos”:
  - [ ] listar ativos por telefone (armazenado localmente)
  - [ ] cancelar agendamento
- [ ] Estados de UX:
  - [ ] loading, empty, erro amigável
  - [ ] bloquear double-submit no botão confirmar

**Aceite:** um cliente real consegue agendar em menos de 60s sem se perder.

---

## EPIC 09 — Frontend Admin (operação do barbeiro)
- [ ] Login simples (V1): campo token/segredo (ou basic gate)
- [ ] Gestão de serviços:
  - [ ] criar/editar/ativar/desativar
- [ ] Configurar horários:
  - [ ] por unidade
  - [ ] por dia da semana
  - [ ] múltiplas janelas
- [ ] Bloqueios:
  - [ ] criar/remover
  - [ ] escolher unidade ou “global”
- [ ] Agenda:
  - [ ] visão dia (com filtro)
  - [ ] visão semana
  - [ ] ações rápidas: cancelar/iniciar/concluir/falta

**Aceite:** barbeiro opera agenda sem depender de suporte técnico.

---

## EPIC 10 — Testes (prontos pra segurar produção)
### Unit
- [ ] Gerador de slots (Disponibilidade)
- [ ] Validador de transições de status (Agendamentos)
- [ ] Normalização de telefone

### Integration (com Postgres)
- [ ] Repositórios com Prisma (CRUD + queries)
- [ ] Constraint de overlap funcionando (teste dedicado)

### E2E (fluxos)
- [ ] Fluxo público: disponibilidade → criar → listar por telefone → cancelar
- [ ] Fluxo admin: criar serviço → criar horário → criar bloqueio → ver agenda → mudar status

**Aceite:** CI roda e pega regressão antes de ir pra Railway.

---

## EPIC 11 — Deploy Railway (staging → produção)
- [ ] Criar projeto no Railway
- [ ] Provisionar Postgres
- [ ] Configurar variáveis:
  - [ ] `DATABASE_URL`
  - [ ] `ADMIN_TOKEN` (ou equivalente)
  - [ ] `NODE_ENV`, `PORT`
- [ ] Configurar comando de deploy:
  - [ ] aplicar migrations automaticamente (`migrate deploy`)
  - [ ] start da aplicação
- [ ] Healthcheck endpoint (ex.: `GET /health`)
- [ ] Criar ambiente **staging** (recomendado) e depois produção
- [ ] Rodar seed com segurança (apenas se necessário, controlado por flag)

**Aceite:** push na main sobe versão nova com migrations sem intervenção manual.

---

## EPIC 12 — Observabilidade e robustez (mínimo profissional)
- [ ] Logs com request-id (entrada/saída/erro)
- [ ] Sanitizar logs (não logar telefone cru em erro)
- [ ] Rate limit leve em endpoints públicos sensíveis (opcional V1)
- [ ] Timeout/retry (quando aplicável)
- [ ] Página/endpoint de status operacional (health)

**Aceite:** quando algo quebra, dá pra entender o que foi sem adivinhar.

---

## EPIC 13 — QA final e entrega
- [ ] Checklist funcional (público):
  - [ ] agendar em Unidade A
  - [ ] agendar em Unidade B
  - [ ] impedir agendar em horário bloqueado
  - [ ] impedir conflito de horários
  - [ ] cancelar e ver slot voltar
- [ ] Checklist funcional (admin):
  - [ ] CRUD serviços ok
  - [ ] horários por unidade ok
  - [ ] bloqueio global ok
  - [ ] agenda dia/semana ok
  - [ ] transições ok
- [ ] Performance mínima:
  - [ ] disponibilidade do dia responde rápido (sem N+1)
- [ ] Documentação final:
  - [ ] rotas + exemplos de request/response
  - [ ] como rodar local
  - [ ] como dar deploy
  - [ ] como fazer rollback (mínimo: re-deploy versão anterior)
- [ ] Go-live:
  - [ ] validar produção com 1–2 agendamentos reais
  - [ ] monitorar logs nas primeiras horas

**Aceite:** sistema operando no Railway, estável, com fluxo real validado.

---

## Sequência recomendada (pra não reescrever)
1) EPIC 00 → 01 → 02  
2) EPIC 03 → 04 → 05 → 06  
3) EPIC 07 (fechar rotas)  
4) EPIC 10 (testes fortes)  
5) EPIC 11 (Railway)  
6) EPIC 08/09 (UI) em paralelo quando API estabilizar  
7) EPIC 12 → 13 (polimento + entrega)

---
