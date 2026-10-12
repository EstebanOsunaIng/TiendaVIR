"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { adjustStock } from "@/actions/inventory/adjust-stock";

const ADJUSTMENT_TYPES = [
  { value: "purchase", label: "Compra / reabasto" },
  { value: "adjustment", label: "Ajuste (merma, conteo)" },
  { value: "return", label: "Devolución" },
] as const;

export function AdjustStockDialog({
  storeSlug,
  variantId,
  variantLabel,
}: {
  storeSlug: string;
  variantId: string;
  variantLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await adjustStock(storeSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>Ajustar</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock — {variantLabel}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="variantId" value={variantId} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Tipo de movimiento</Label>
            <Select name="type" defaultValue="adjustment">
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ADJUSTMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="quantity">
              Cantidad (positiva = entrada, negativa = salida)
            </Label>
            <Input id="quantity" name="quantity" type="number" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Input id="note" name="note" />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Registrar movimiento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
