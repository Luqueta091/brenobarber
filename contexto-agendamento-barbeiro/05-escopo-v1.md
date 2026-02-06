# ESCOPO V1 — Sistema de Agendamento — Barbeiro Único com 2 Barbearias

## ✅ Entra na V1 (essencial)

### Público (cliente)
- Páginas separadas:
  - `/unidadeA`
  - `/unidadeB`
- Listar **serviços ativos**
- Exibir **disponibilidade real** (slots calculados)
- Criar agendamento com **confirmação automática**
- Antes de finalizar: coletar **nome + telefone**
- **Salvar contato no dispositivo** (cache/localStorage) para pré-preenchimento em visitas futuras
- Página de confirmação exibindo:
  - dados do agendamento criado
  - lista de **agendamentos ativos** do telefone (quando disponível no dispositivo)
  - ação de **cancelar** (a qualquer momento)

### Admin (barbeiro)
- CRUD de **Serviços** (criar/editar/remover/ativar/desativar)
- CRUD de **Horários de trabalho** por unidade (dia da semana + janelas)
- CRUD de **Bloqueios** (períodos fechados)
- Visualizar agenda por dia/semana
- Cancelar agendamento
- Marcar: Em atendimento / Concluído / Falta

### Regras
- Impedir **sobreposição** de agendamentos (um barbeiro só)
- Disponibilidade sempre consistente com horários + bloqueios + agendamentos

## ❌ Fora da V1 (V2+)
- Lembretes (WhatsApp/SMS/Email)
- Verificação por código (OTP) / autenticação de verdade
- Pagamento / sinal
- Reagendamento (em vez de cancelar + criar)
- Integração Google Calendar
- Relatórios avançados

## ✅ Critério de pronto (Definition of Done da V1)
- Cliente consegue:
  1) entrar em `/unidadeA` ou `/unidadeB`  
  2) ver horários disponíveis reais  
  3) escolher serviço e agendar informando nome+telefone  
  4) ver confirmação e cancelar a qualquer momento  
  5) voltar no mesmo dispositivo e ter **nome+telefone pré-preenchidos**
- Barbeiro consegue:
  1) manter serviços  
  2) configurar horários por unidade  
  3) bloquear períodos  
  4) ver agenda e operar status  
- Sistema garante:
  - **zero conflito** (sem sobreposição)
  - disponibilidade derivada corretamente (sem slots fantasma)
