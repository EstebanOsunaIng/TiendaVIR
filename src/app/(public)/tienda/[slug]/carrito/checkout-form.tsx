"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/public/cart-context";
import { createOrderRequest } from "@/actions/order-requests/create-order-request";
import { buildWaLink } from "@/lib/whatsapp/build-wa-link";
import { formatCurrency } from "@/lib/currency";

export function CheckoutForm({
  storeId,
  storeName,
  whatsappNumber,
  currency,
}: {
  storeId: string;
  storeName: string;
  whatsappNumber: string | null;
  currency: string;
}) {
  const { items, setQuantity, removeItem, clear, total } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createOrderRequest({
        storeId,
        customerName: formData.get("customerName"),
        customerPhone: formData.get("customerPhone"),
        customerNote: formData.get("customerNote") ?? "",
        items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (whatsappNumber) {
        setWaLink(
          buildWaLink(
            whatsappNumber,
            storeName,
            items.map((item) => ({
              productName: item.productName,
              size: item.size,
              color: item.color,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            currency,
          ),
        );
      }
      clear();
    });
  }

  if (waLink) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm">
          Enviamos tu solicitud a la tienda. Termina de confirmar tu pedido por WhatsApp:
        </p>
        <Button render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}>
          Abrir WhatsApp
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground">Tu carrito está vacío.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.variantId} className="flex items-center justify-between gap-3 border-b py-2">
            <div>
              <p className="text-sm font-medium">{item.productName}</p>
              <p className="text-xs text-muted-foreground">
                {[item.size, item.color].filter(Boolean).join(" / ")} ·{" "}
                {formatCurrency(item.unitPrice, currency)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
                className="w-16"
              />
              <Button variant="ghost" size="sm" onClick={() => removeItem(item.variantId)}>
                Quitar
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-right font-medium">Total: {formatCurrency(total, currency)}</p>

      <form action={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerName">Tu nombre</Label>
          <Input id="customerName" name="customerName" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerPhone">Tu teléfono</Label>
          <Input id="customerPhone" name="customerPhone" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="customerNote">Nota (opcional)</Label>
          <Input id="customerNote" name="customerNote" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enviando..." : "Enviar solicitud de pedido"}
        </Button>
      </form>
    </div>
  );
}
