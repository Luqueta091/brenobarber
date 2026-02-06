# ENTIDADES — Sistema de Agendamento — Barbeiro Único com 2 Barbearias

## Entidades principais (V1)
| Entidade | Para que existe | Campos essenciais (V1) |
|---|---|---|
| **Unidade** | Representa as barbearias e sustenta páginas por unidade | `id`, `slug` (unidadeA/unidadeB), `nome` |
| **Serviço** | O que o cliente escolhe | `id`, `nome`, `duracao_minutos`, `preco`, `ativo` |
| **HorárioTrabalho** | Regra semanal editável por unidade | `id`, `unidade_id`, `dia_semana (0-6)`, `hora_inicio`, `hora_fim`, `ativo` |
| **BloqueioAgenda** | Exceções (folga/compromisso/bloqueio) | `id`, `inicio_em`, `fim_em`, `motivo`, `unidade_id (opcional)` |
| **Cliente** | Identifica o cliente para vincular agendamentos | `id`, `nome`, `telefone`, `criado_em` |
| **Agendamento** | Reserva de horário | `id`, `unidade_id`, `servico_id`, `cliente_id`, `inicio_em`, `fim_em`, `status`, `criado_em` |

## Regras de negócio que impactam modelagem
- **Disponibilidade é derivada (não tabela):**  
  `HorárioTrabalho` − `Agendamentos (ativos)` − `Bloqueios`.
- **Um barbeiro só → zero sobreposição**, mesmo entre unidades.
- **Sem conta/senha:** cliente informa **nome + telefone** para finalizar; o front-end pode **armazenar localmente** para pré-preencher e recuperar “agendamentos ativos” daquele telefone no mesmo dispositivo.

## ERD (Mermaid)
```mermaid
erDiagram
  UNIDADE {
    uuid id PK
    string slug UK
    string nome
  }

  SERVICO {
    uuid id PK
    string nome
    int duracao_minutos
    decimal preco
    boolean ativo
  }

  HORARIO_TRABALHO {
    uuid id PK
    uuid unidade_id FK
    int dia_semana
    time hora_inicio
    time hora_fim
    boolean ativo
  }

  BLOQUEIO_AGENDA {
    uuid id PK
    datetime inicio_em
    datetime fim_em
    string motivo
    uuid unidade_id FK "opcional"
  }

  CLIENTE {
    uuid id PK
    string nome
    string telefone
    datetime criado_em
  }

  AGENDAMENTO {
    uuid id PK
    uuid unidade_id FK
    uuid servico_id FK
    uuid cliente_id FK
    datetime inicio_em
    datetime fim_em
    string status
    datetime criado_em
  }

  UNIDADE ||--o{ HORARIO_TRABALHO : "define"
  UNIDADE ||--o{ AGENDAMENTO : "recebe"
  UNIDADE ||--o{ BLOQUEIO_AGENDA : "pode ter"
  SERVICO ||--o{ AGENDAMENTO : "é escolhido em"
  CLIENTE ||--o{ AGENDAMENTO : "faz"
```
