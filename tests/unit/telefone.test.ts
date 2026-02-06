import { describe, expect, it } from "vitest";
import { normalizeTelefone } from "../../src/common/utils/telefone.js";

describe("normalizeTelefone", () => {
  it("remove non digits", () => {
    expect(normalizeTelefone("(11) 91234-5678")).toBe("5511912345678");
  });

  it("keeps longer numbers", () => {
    expect(normalizeTelefone("+351919999999")).toBe("351919999999");
  });
});
