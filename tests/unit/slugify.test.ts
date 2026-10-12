import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("convierte espacios y mayúsculas a guiones en minúsculas", () => {
    expect(slugify("Blusa Floral Talla M")).toBe("blusa-floral-talla-m");
  });

  it("elimina acentos", () => {
    expect(slugify("Pantalón Café")).toBe("pantalon-cafe");
  });

  it("colapsa caracteres no alfanuméricos repetidos", () => {
    expect(slugify("  Vestido -- Rojo!! ")).toBe("vestido-rojo");
  });

  it("no deja guiones al inicio ni al final", () => {
    expect(slugify("--Falda--")).toBe("falda");
  });
});
