"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/currency";
import { registerSale } from "@/actions/sales/register-sale";

type AvailableVariant = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock: number;
  unitPrice: number;
  productName: string;
};

type LineItem = { variantId: string; quantity: number };

export function NewSaleForm({
  storeSlug,
  variants,
  currency,
}: {
  storeSlug: string;
  variants: AvailableVariant[];
  currency: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return variants.filter(
      (v) =>
        v.stock > 0 &&
        (v.productName.toLowerCase().includes(term) || v.sku.toLowerCase().includes(term)),
    );
  }, [search, variants]);

  const byId = useMemo(() => new Map(variants.map((v) => [v.id, v])), [variants]);

  function addLine(variantId: string) {
    setLines((prev) => {
      const existing = prev.find((l) => l.variantId === variantId);
      if (existing) {
        return prev.map((l) =>
          l.variantId === variantId ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { variantId, quantity: 1 }];
    });
    setSearch("");
  }

  function setQuantity(variantId: string, quantity: number) {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.variantId !== variantId)
        : prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)),
    );
  }

  const total = lines.reduce((sum, l) => sum + (byId.get(l.variantId)?.unitPrice ?? 0) * l.quantity, 0);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await registerSale(storeSlug, {
        clientRequestId: crypto.randomUUID(),
        notes,
        items: lines.map((l) => ({
          variantId: l.variantId,
          quantity: l.quantity,
          unitPrice: byId.get(l.variantId)?.unitPrice ?? 0,
        })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/tienda-admin/${storeSlug}/ventas`);
    });
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="search">Buscar producto o SKU</Label>
        <Input id="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        {filtered.length > 0 ? (
          <ul className="rounded-md border">
            {filtered.slice(0, 8).map((variant) => (
              <li key={variant.id}>
                <button
                  type="button"
                  onClick={() => addLine(variant.id)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span>
                    {variant.productName} {[variant.size, variant.color].filter(Boolean).join(" / ")}
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(variant.unitPrice, currency)} · stock {variant.stock}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2">
        {lines.map((line) => {
          const variant = byId.get(line.variantId);
          if (!variant) return null;
          return (
            <li key={line.variantId} className="flex items-center justify-between border-b py-2">
              <span className="text-sm">
                {variant.productName} {[variant.size, variant.color].filter(Boolean).join(" / ")}
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={variant.stock}
                  value={line.quantity}
                  onChange={(e) => setQuantity(line.variantId, Number(e.target.value))}
                  className="w-20"
                />
                <span className="w-20 text-right text-sm">
                  {formatCurrency(variant.unitPrice * line.quantity, currency)}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {lines.length > 0 ? (
        <p className="text-right font-medium">Total: {formatCurrency(total, currency)}</p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Nota (opcional)</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={handleSubmit} disabled={isPending || lines.length === 0}>
        {isPending ? "Registrando..." : "Registrar venta"}
      </Button>
    </div>
  );
}
