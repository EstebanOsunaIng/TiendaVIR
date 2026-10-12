"use client";

import Link from "next/link";
import { useCart } from "@/components/public/cart-context";

export function CartLink({ storeSlug }: { storeSlug: string }) {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link href={`/tienda/${storeSlug}/carrito`} className="text-sm underline">
      Carrito ({count})
    </Link>
  );
}
