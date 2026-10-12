"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/public/cart-context";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
};

type FullVariant = Variant & { unitPrice: number; sku: string };

function resolveVariant(
  variants: FullVariant[],
  size: string | null,
  color: string | null,
): FullVariant {
  return (
    variants.find((v) => v.size === size && v.color === color) ??
    variants.find((v) => v.size === size) ??
    variants.find((v) => v.color === color) ??
    variants[0]
  );
}

export function AddToCart({
  storeSlug,
  productId,
  productName,
  imageUrl,
  currency,
  variants,
}: {
  storeSlug: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  currency: string;
  variants: FullVariant[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selected, setSelected] = useState(() => variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const sizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean))) as string[];
  const colors = Array.from(new Set(variants.map((v) => v.color).filter(Boolean))) as string[];
  const outOfStock = selected.stock <= 0;

  function selectSize(size: string) {
    setSelected(resolveVariant(variants, size, selected.color));
    setQuantity(1);
    setAdded(false);
  }

  function selectColor(color: string) {
    setSelected(resolveVariant(variants, selected.size, color));
    setQuantity(1);
    setAdded(false);
  }

  function handleAdd() {
    addItem({
      variantId: selected.id,
      productId,
      productName,
      sku: selected.sku,
      size: selected.size,
      color: selected.color,
      unitPrice: selected.unitPrice,
      quantity,
      imageUrl,
    });
    setAdded(true);
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="font-heading text-2xl">{formatCurrency(selected.unitPrice, currency)}</p>

      {sizes.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Talla</Label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => selectSize(size)}
                disabled={variants.every((v) => v.size !== size || v.stock <= 0)}
                aria-pressed={selected.size === size}
                className={cn(
                  "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  selected.size === size
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-foreground/30",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => selectColor(color)}
                disabled={variants.every((v) => v.color !== color || v.stock <= 0)}
                aria-pressed={selected.color === color}
                className={cn(
                  "flex h-10 items-center justify-center rounded-lg border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  selected.color === color
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input hover:border-foreground/30",
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {outOfStock ? (
        <StatusBadge status="sold-out" />
      ) : selected.stock <= 3 ? (
        <p className="text-sm text-muted-foreground">Últimas {selected.stock} unidades disponibles</p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="quantity">Cantidad</Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          max={selected.stock || 1}
          value={quantity}
          disabled={outOfStock}
          onChange={(e) => setQuantity(Math.max(1, Math.min(selected.stock, Number(e.target.value))))}
          className="w-24"
        />
      </div>

      <Button onClick={handleAdd} disabled={outOfStock} size="lg">
        {outOfStock ? "Agotado" : "Agregar al carrito"}
      </Button>

      {added ? (
        <div className="flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          <span>Se agregó al carrito.</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-success"
            onClick={() => router.push(`/tienda/${storeSlug}/carrito`)}
          >
            Ver carrito
          </Button>
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Esto genera una solicitud de pedido — la tienda la confirma por WhatsApp antes de cualquier
        cobro o entrega.
      </p>
    </div>
  );
}
