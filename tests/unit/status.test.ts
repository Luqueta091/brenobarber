import { describe, expect, it } from "vitest";
import { validarTransicao } from "../../src/modules/agendamentos/domain/status.js";

describe("validarTransicao", () => {
  it("permite transicao valida", () => {
    expect(() => validarTransicao("Confirmado", "EmAtendimento")).not.toThrow();
  });

  it("bloqueia transicao invalida", () => {
    expect(() => validarTransicao("Concluido", "EmAtendimento")).toThrow();
  });
});
