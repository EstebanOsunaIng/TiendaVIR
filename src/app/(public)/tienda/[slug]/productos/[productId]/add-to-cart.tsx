"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/components/public/cart-context";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
};

export function AddToCart({
  storeSlug,
  productId,
  productName,
  imageUrl,
  variants,
}: {
  storeSlug: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  variants: (Variant & { unitPrice: number; sku: string })[];
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);

  const selected = variants.find((v) => v.id === variantId);
  const outOfStock = !selected || selected.stock <= 0;

  function handleAdd() {
    if (!selected) return;
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
    router.push(`/tienda/${storeSlug}/carrito`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Select value={variantId} onValueChange={(value) => setVariantId(value ?? "")}>
        <SelectTrigger>
          <SelectValue placeholder="Elige talla/color" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((variant) => (
            <SelectItem key={variant.id} value={variant.id} disabled={variant.stock <= 0}>
              {[variant.size, variant.color].filter(Boolean).join(" / ") || variant.sku}
              {variant.stock <= 0 ? " (agotado)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="number"
        min={1}
        max={selected?.stock ?? 1}
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        className="w-24"
      />

      <Button onClick={handleAdd} disabled={outOfStock}>
        {outOfStock ? "Agotado" : "Agregar al carrito"}
      </Button>
    </div>
  );
}
