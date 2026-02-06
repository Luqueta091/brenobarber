# ATORES — Sistema de Agendamento — Barbeiro Único com 2 Barbearias

## Usuários (pessoas)
| Ator | O que faz | O que precisa |
|---|---|---|
| **Cliente (público)** | Acessa `/unidadeA` ou `/unidadeB`, escolhe serviço e horário | Ver dias/horários disponíveis da unidade, informar nome+telefone para finalizar |
| **Cliente (mesmo dispositivo)** | Retorna ao site | Ter contato pré-preenchido (nome+telefone) e ver/cancelar **agendamentos ativos** associados ao telefone |
| **Barbeiro (admin)** | Configura e opera o sistema | CRUD serviços, definir/editar horários por unidade, criar bloqueios, ver agenda, cancelar, marcar concluído/falta |

## Sistemas externos
| Sistema | Por que | V1 |
|---|---|---|
| Nenhum obrigatório | V1 funciona com Web + Postgres | ✅ |

## Automações (jobs)
| Job | Quando roda | O que faz | V1 |
|---|---|---|---|
| **Cálculo de disponibilidade** | Sob demanda (quando abrir a página) | Deriva slots de horário a partir de horários de trabalho − agendamentos − bloqueios | ✅ |
| Lembretes | 24h/2h antes | Notificar cliente | ❌ (V2) |

## Diagrama (mapa de atores)
```mermaid
flowchart TB
  subgraph Publico["🌐 Público"]
    UA["/unidadeA<br/>Agendamento Unidade A"]
    UB["/unidadeB<br/>Agendamento Unidade B"]
    CONF["Página de confirmação<br/>+ agendamentos ativos<br/>(baseado em telefone salvo no dispositivo)"]
  end

  subgraph Admin["🔐 Admin do Barbeiro"]
    ADM["/admin<br/>Serviços + Horários + Bloqueios + Agenda"]
  end

  subgraph Core["⚙️ Core de Agendamento"]
    DISP["Disponibilidade (calculada)"]
    AG["Agendamentos"]
    SRV["Serviços"]
    HR["Horários de trabalho"]
    BLK["Bloqueios/Exceções"]
    DB["Postgres"]
  end

  C["👤 Cliente"] --> UA --> DISP
  C --> UB --> DISP
  UA --> AG
  UB --> AG
  AG --> CONF

  B["💈 Barbeiro"] --> ADM --> SRV
  B --> ADM --> HR
  B --> ADM --> BLK
  B --> ADM --> AG

  DISP --> HR
  DISP --> BLK
  DISP --> AG
  SRV <--> DB
  HR <--> DB
  BLK <--> DB
  AG <--> DB
```
