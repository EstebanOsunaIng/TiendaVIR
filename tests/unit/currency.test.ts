import { describe, expect, it } from "vitest";
import { formatCurrency } from "@/lib/currency";

describe("formatCurrency", () => {
  it("formatea montos en USD con dos decimales", () => {
    expect(formatCurrency(19.9, "USD", "en")).toBe("$19.90");
  });

  it("redondea a dos decimales", () => {
    expect(formatCurrency(10.005, "USD", "en")).toBe("$10.01");
  });

  it("formatea en otra moneda", () => {
    expect(formatCurrency(100, "MXN", "en")).toBe("MX$100.00");
  });
});
