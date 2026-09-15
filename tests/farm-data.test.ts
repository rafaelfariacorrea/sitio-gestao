import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, makeId } from "../lib/farm-data";

describe("farm-data helpers", () => {
  it("formats Brazilian currency", () => {
    expect(formatCurrency(1234.5)).toContain("1.234,50");
    expect(formatCurrency(null)).toBe("R$ —");
  });

  it("formats a transaction date in pt-BR", () => {
    expect(formatDate("2026-09-15T12:00:00.000Z")).toMatch(/15/);
  });

  it("creates unique prefixed ids", () => {
    const id = makeId("inventory");
    expect(id.startsWith("inventory-")).toBe(true);
  });
});
