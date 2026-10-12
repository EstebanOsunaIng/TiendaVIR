"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/actions/products/delete-product";

export function DeleteProductButton({
  storeSlug,
  productId,
}: {
  storeSlug: string;
  productId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      await deleteProduct(storeSlug, productId);
      router.push(`/tienda-admin/${storeSlug}/productos`);
    });
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? "Eliminando..." : confirming ? "¿Seguro? Confirmar" : "Eliminar producto"}
    </Button>
  );
}
