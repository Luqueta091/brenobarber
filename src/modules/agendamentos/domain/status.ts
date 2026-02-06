import type { AgendamentoStatus } from "@prisma/client";
import { validationError } from "../../../common/errors/app-error.js";

const transitions: Record<AgendamentoStatus, AgendamentoStatus[]> = {
  Confirmado: [
    "EmAtendimento",
    "CanceladoCliente",
    "CanceladoBarbeiro",
    "Falta"
  ],
  EmAtendimento: ["Concluido"],
  CanceladoCliente: [],
  CanceladoBarbeiro: [],
  Concluido: [],
  Falta: []
};

export function validarTransicao(atual: AgendamentoStatus, proximo: AgendamentoStatus) {
  const permitidos = transitions[atual] ?? [];
  if (!permitidos.includes(proximo)) {
    throw validationError("Transição de status inválida", { atual, proximo });
  }
}

export const statusesAtivos: AgendamentoStatus[] = ["Confirmado", "EmAtendimento"];
