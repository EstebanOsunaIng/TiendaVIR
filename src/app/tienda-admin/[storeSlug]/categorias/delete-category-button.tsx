"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/actions/categories/delete-category";

export function DeleteCategoryButton({
  storeSlug,
  categoryId,
}: {
  storeSlug: string;
  categoryId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await deleteCategory(storeSlug, categoryId);
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} disabled={isPending}>
      Eliminar
    </Button>
  );
}
