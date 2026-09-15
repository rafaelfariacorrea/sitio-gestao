import { describe, expect, it } from "vitest";
import { buildCsv } from "../lib/export-helpers";
import { daysUntil, formatCurrency, formatDate, isExpired, isExpiringSoon, makeId } from "../lib/farm-data";

describe("farm-data helpers", () => {
  it("formats Brazilian currency", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatCurrency(null)).toBe("R$ —");
  });
  it("formats a transaction date in pt-BR", () => {
    expect(formatDate("2026-09-15T12:00:00.000Z")).toMatch(/15/);
  });
  it("creates unique prefixed ids", () => {
    expect(makeId("inventory").startsWith("inventory-")).toBe(true);
  });
  it("identifies expired and soon-to-expire inventory", () => {
    const now = new Date("2026-09-15T12:00:00");
    expect(daysUntil("2026-09-10", now)).toBeLessThan(0);
    expect(isExpired("2026-09-10", now)).toBe(true);
    expect(isExpiringSoon("2026-10-01", now)).toBe(true);
  });
  it("exports both financial and inventory sections to CSV", () => {
    const state = {
      transactions: [{ id: "t1", kind: "expense", description: "Adubo", category: "Insumo", culture: "Banana", amount: 100, date: "2026-09-15T12:00:00.000Z" }],
      inventory: [{ id: "i1", name: "NPK", category: "Insumo", quantity: 2, unit: "sacos", minimum: 1, expiresAt: "2026-12-31", updatedAt: "2026-09-15T12:00:00.000Z" }],
      cropPlans: [], location: { latitude: 0, longitude: 0, label: "Teste" },
    };
    // @ts-ignore — objeto de teste mínimo para a função de exportação
    const csv = buildCsv(state);
    expect(csv).toContain("FINANÇAS");
    expect(csv).toContain("INVENTÁRIO");
    expect(csv).toContain("Banana");
    expect(csv).toContain("2026-12-31");
  });
});
