"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(storeSlug: string) {
  return `tiendavit-cart-${storeSlug}`;
}

export function CartProvider({
  storeSlug,
  children,
}: {
  storeSlug: string;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    // Hidratar desde localStorage solo puede pasar después del mount (no
    // existe en el servidor); esta es la sincronización inicial con ese
    // sistema externo, no un efecto en cascada evitable.
    try {
      const raw = localStorage.getItem(storageKey(storeSlug));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage puede no estar disponible (modo privado); el carrito
      // simplemente empieza vacío en ese caso.
    }
  }, [storeSlug]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(storeSlug), JSON.stringify(items));
    } catch {
      // ver nota arriba.
    }
  }, [storeSlug, items]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items,
      addItem: (item) => {
        setItems((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (existing) {
            return prev.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            );
          }
          return [...prev, item];
        });
      },
      removeItem: (variantId) => {
        setItems((prev) => prev.filter((i) => i.variantId !== variantId));
      },
      setQuantity: (variantId, quantity) => {
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.variantId !== variantId)
            : prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
        );
      },
      clear: () => setItems([]),
      total: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
