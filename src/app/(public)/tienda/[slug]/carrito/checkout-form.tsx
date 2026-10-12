"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  CheckCircle2Icon,
  ImageIcon,
  MessageCircleIcon,
  ShoppingBagIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/shared/empty-state";
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
  const [submitted, setSubmitted] = useState(false);
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
      // Importante: `submitted` se marca siempre, independientemente de si
      // hay WhatsApp configurado. Antes, sin número de WhatsApp, clear()
      // vaciaba el carrito y la pantalla caía directo al estado "carrito
      // vacío" sin ninguna confirmación visible para el cliente.
      setSubmitted(true);
      clear();
    });
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2Icon className="size-6 text-success" />
        </div>
        <p className="font-heading text-xl">Solicitud enviada</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          La tienda revisará tu solicitud y te confirmará disponibilidad, precio final y forma de
          entrega. Esto todavía no es una compra confirmada.
        </p>
        {waLink ? (
          <Button render={<a href={waLink} target="_blank" rel="noopener noreferrer" />} size="lg">
            <MessageCircleIcon />
            Continuar por WhatsApp
          </Button>
        ) : null}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBagIcon}
        title="Tu carrito está vacío"
        description="Explora el catálogo y agrega productos para enviar una solicitud de pedido."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Tu pedido</h2>
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.variantId} className="flex items-center gap-3 border-b border-border py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="size-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {[item.size, item.color].filter(Boolean).join(" / ")} ·{" "}
                  {formatCurrency(item.unitPrice, currency)}
                </p>
              </div>
              <Input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => setQuantity(item.variantId, Number(e.target.value))}
                className="w-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Quitar del carrito"
                onClick={() => removeItem(item.variantId)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
        <p className="text-right font-heading text-lg">Total: {formatCurrency(total, currency)}</p>
      </div>

      <form action={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Tus datos de contacto</h2>
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
        <p className="text-xs text-muted-foreground">
          Esto envía una solicitud a la tienda — no es una compra confirmada ni se cobra nada todavía.
        </p>
      </form>
    </div>
  );
}
