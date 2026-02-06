# PROBLEMA — Sistema de Agendamento — Barbeiro Único com 2 Barbearias

**Data:** 04/02/2026

## Quem
- **Barbeiro único**, sem funcionários.
- Atende em **duas barbearias (Unidade A e Unidade B)**.
- O barbeiro define e edita **dias/horários de trabalho** para cada unidade.

## Situação atual
- **Não existe sistema de agendamento ainda** (projeto do zero).
- O cliente precisa conseguir marcar horário de forma simples, com a regra de que a disponibilidade depende da unidade e do dia/horário configurado pelo barbeiro.

## Causa raiz
- Falta uma agenda centralizada que:
  - aplique as regras de disponibilidade por unidade (definidas pelo barbeiro);
  - calcule horários livres a partir de **horários de trabalho + bloqueios + agendamentos existentes**;
  - impeça **conflitos/sobreposição** (é um barbeiro só).

## Consequência (se não resolver bem)
- Cliente não consegue agendar (perda de oportunidade).
- Confusão de unidade/dia, slots “fantasmas” e conflitos de agenda.
- Retrabalho para o barbeiro corrigir manualmente.

## Como o sistema resolve
- Agendamento público por páginas separadas:
  - `.../unidadeA`
  - `.../unidadeB`
- O cliente escolhe serviço e horário disponível.
- Antes de finalizar, informa **nome + telefone** (sem conta e sem senha).
- O sistema **salva esse contato no dispositivo** (ex.: localStorage/cache) para:
  - **pré-preencher** em visitas futuras;
  - permitir uma página de confirmação que liste **agendamentos ativos** do telefone naquele dispositivo, com opção de **cancelar**.

> 💡 Em uma frase: um barbeiro único com duas unidades precisa de agendamento online que publique disponibilidade real por unidade, evite conflitos e permita ao cliente cancelar — sem exigir conta, só nome+telefone com pré-preenchimento no próprio dispositivo.
