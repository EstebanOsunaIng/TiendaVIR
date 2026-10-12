"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory } from "@/actions/categories/create-category";

export function CategoryForm({ storeSlug }: { storeSlug: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createCategory(storeSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="category-name">Nueva categoría</Label>
        <Input id="category-name" name="name" required className="w-56" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando..." : "Agregar"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
