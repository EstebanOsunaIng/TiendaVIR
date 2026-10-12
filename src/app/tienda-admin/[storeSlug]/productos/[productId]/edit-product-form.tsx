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
import { Checkbox } from "@/components/ui/checkbox";
import { updateProduct } from "@/actions/products/update-product";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  is_published: boolean;
};

export function EditProductForm({
  storeSlug,
  product,
  categories,
}: {
  storeSlug: string;
  product: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProduct(storeSlug, product.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={product.name} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" name="description" defaultValue={product.description ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="categoryId">Categoría</Label>
        <Select name="categoryId" defaultValue={product.category_id ?? undefined}>
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
        <Input
          id="basePrice"
          name="basePrice"
          type="number"
          step="0.01"
          min="0"
          defaultValue={product.base_price}
          required
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox name="isPublished" defaultChecked={product.is_published} />
        Publicado en el catálogo
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-success">Guardado.</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
