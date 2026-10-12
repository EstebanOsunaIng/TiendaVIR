import { formatCurrency } from "@/lib/currency";

export type WhatsAppCartItem = {
  productName: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number;
};

/**
 * Construye un enlace wa.me con un mensaje prellenado listando el carrito.
 * `whatsappNumber` debe venir ya en formato internacional sin "+" ni
 * espacios (ej. "521234567890"); se limpia por si acaso.
 */
export function buildWaLink(
  whatsappNumber: string,
  storeName: string,
  items: WhatsAppCartItem[],
  currency = "USD",
): string {
  const digitsOnly = whatsappNumber.replace(/\D/g, "");

  const lines = [`Hola, quiero pedir esto de ${storeName}:`, ""];

  let total = 0;
  for (const item of items) {
    const variantLabel = [item.size, item.color].filter(Boolean).join(" / ");
    const subtotal = item.unitPrice * item.quantity;
    total += subtotal;
    lines.push(
      `• ${item.productName}${variantLabel ? ` (${variantLabel})` : ""} x${item.quantity} — ${formatCurrency(subtotal, currency)}`,
    );
  }

  lines.push("", `Total estimado: ${formatCurrency(total, currency)}`);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${digitsOnly}?text=${text}`;
}
