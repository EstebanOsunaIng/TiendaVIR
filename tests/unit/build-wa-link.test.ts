import { describe, expect, it } from "vitest";
import { buildWaLink } from "@/lib/whatsapp/build-wa-link";

describe("buildWaLink", () => {
  it("limpia el número de teléfono a solo dígitos", () => {
    const link = buildWaLink("+52 123 456 7890", "Mi Tienda", [
      { productName: "Blusa", quantity: 1, unitPrice: 10 },
    ]);
    expect(link.startsWith("https://wa.me/521234567890?text=")).toBe(true);
  });

  it("incluye el nombre del producto, cantidad y total en el mensaje", () => {
    const link = buildWaLink("5211111111", "Mi Tienda", [
      { productName: "Blusa Floral", size: "M", color: "Rojo", quantity: 2, unitPrice: 10 },
    ]);
    const message = decodeURIComponent(link.split("?text=")[1]);
    expect(message).toContain("Mi Tienda");
    expect(message).toContain("Blusa Floral (M / Rojo) x2");
    expect(message).toContain("Total estimado:");
    expect(message).toContain("20,00");
  });

  it("suma el total de varios productos", () => {
    const link = buildWaLink("5211111111", "Mi Tienda", [
      { productName: "A", quantity: 1, unitPrice: 10 },
      { productName: "B", quantity: 3, unitPrice: 5 },
    ]);
    const message = decodeURIComponent(link.split("?text=")[1]);
    expect(message).toContain("25,00");
  });

  it("no revienta con un carrito vacío", () => {
    const link = buildWaLink("5211111111", "Mi Tienda", []);
    const message = decodeURIComponent(link.split("?text=")[1]);
    expect(message).toContain("0,00");
  });

  it("escapa caracteres especiales en la URL", () => {
    const link = buildWaLink("5211111111", "Tienda & Más", [
      { productName: "Producto ñ/x", quantity: 1, unitPrice: 1 },
    ]);
    expect(link).not.toContain(" ");
    expect(link).not.toContain("&product");
  });
});
