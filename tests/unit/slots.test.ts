import { describe, expect, it } from "vitest";
import { buildSlots, overlaps } from "../../src/common/utils/date.js";

describe("buildSlots", () => {
  it("gera slots de acordo com duracao", () => {
    const start = new Date("2026-02-04T09:00:00Z");
    const end = new Date("2026-02-04T10:00:00Z");
    const slots = buildSlots(start, end, 30);
    expect(slots).toHaveLength(2);
    expect(slots[0].inicio.toISOString()).toBe("2026-02-04T09:00:00.000Z");
  });
});

describe("overlaps", () => {
  it("detecta overlap", () => {
    const aStart = new Date("2026-02-04T09:00:00Z");
    const aEnd = new Date("2026-02-04T09:30:00Z");
    const bStart = new Date("2026-02-04T09:15:00Z");
    const bEnd = new Date("2026-02-04T09:45:00Z");
    expect(overlaps(aStart, aEnd, bStart, bEnd)).toBe(true);
  });
});
