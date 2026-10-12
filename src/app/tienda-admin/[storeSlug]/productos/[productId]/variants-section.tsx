"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { addVariant, setVariantActive } from "@/actions/products/manage-variants";

type Variant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  is_active: boolean;
};

export function VariantsSection({
  storeSlug,
  productId,
  variants,
}: {
  storeSlug: string;
  productId: string;
  variants: Variant[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addVariant(storeSlug, productId, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleToggle(variantId: string, isActive: boolean) {
    startTransition(async () => {
      await setVariantActive(storeSlug, variantId, isActive);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Variantes</h2>
      <ul className="flex flex-col gap-1 text-sm">
        {variants.map((variant) => (
          <li key={variant.id} className="flex items-center justify-between border-b py-2">
            <div>
              <span className="font-mono">{variant.sku}</span>{" "}
              {[variant.size, variant.color].filter(Boolean).join(" / ")} — stock: {variant.stock}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={variant.is_active ? "default" : "secondary"}>
                {variant.is_active ? "Activa" : "Inactiva"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleToggle(variant.id, !variant.is_active)}
              >
                {variant.is_active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <form action={handleAdd} className="flex flex-col gap-3 rounded-lg border p-4">
        <p className="text-sm font-medium">Agregar variante</p>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="new-sku">SKU</Label>
            <Input id="new-sku" name="sku" required />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="new-size">Talla</Label>
            <Input id="new-size" name="size" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="new-color">Color</Label>
            <Input id="new-color" name="color" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="new-priceOverride">Precio distinto (opcional)</Label>
            <Input id="new-priceOverride" name="priceOverride" type="number" step="0.01" min="0" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="new-initialStock">Stock inicial</Label>
            <Input
              id="new-initialStock"
              name="initialStock"
              type="number"
              min="0"
              defaultValue={0}
              required
            />
          </div>
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={isPending} className="w-fit">
          {isPending ? "Agregando..." : "Agregar variante"}
        </Button>
      </form>
    </div>
  );
}
