"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { useCart } from "@/components/public/cart-context";

export function CartLink({ storeSlug }: { storeSlug: string }) {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href={`/tienda/${storeSlug}/carrito`}
      aria-label={`Carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`}
      className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
    >
      <ShoppingBagIcon className="size-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
