"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct } from "@/actions/products/create-product";

type Category = { id: string; name: string };

export function NewProductForm({
  storeSlug,
  categories,
}: {
  storeSlug: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createProduct(storeSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/tienda-admin/${storeSlug}/productos/${result.productId}`);
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" name="description" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <Select name="categoryId">
          <SelectTrigger id="categoryId">
            <SelectValue placeholder="Sin categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="basePrice">Precio base</Label>
        <Input id="basePrice" name="basePrice" type="number" step="0.01" min="0" required />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isPublished" defaultChecked />
        Publicado en el catálogo
      </label>

      <fieldset className="flex flex-col gap-3 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Primera variante</legend>
        <div className="flex flex-col gap-2">
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" name="sku" required />
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="size">Talla</Label>
            <Input id="size" name="size" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="color">Color</Label>
            <Input id="color" name="color" />
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="priceOverride">Precio distinto (opcional)</Label>
            <Input id="priceOverride" name="priceOverride" type="number" step="0.01" min="0" />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="initialStock">Stock inicial</Label>
            <Input id="initialStock" name="initialStock" type="number" min="0" defaultValue={0} required />
          </div>
        </div>
      </fieldset>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Crear producto"}
      </Button>
    </form>
  );
}
