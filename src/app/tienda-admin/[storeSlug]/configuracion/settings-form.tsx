"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStoreSettings } from "@/actions/store/update-settings";

export function SettingsForm({
  storeSlug,
  description,
  whatsappNumber,
  currency,
  defaultLowStockThreshold,
}: {
  storeSlug: string;
  description: string | null;
  whatsappNumber: string | null;
  currency: string;
  defaultLowStockThreshold: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateStoreSettings(storeSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form action={handleSubmit} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Descripción pública de la tienda</Label>
        <Input id="description" name="description" defaultValue={description ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsappNumber">Número de WhatsApp (con código de país)</Label>
        <Input
          id="whatsappNumber"
          name="whatsappNumber"
          placeholder="+52 1 234 567 8900"
          defaultValue={whatsappNumber ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Aquí llegan los pedidos que los clientes envíen desde el catálogo público.
        </p>
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="currency">Moneda (ISO, 3 letras)</Label>
          <Input id="currency" name="currency" maxLength={3} defaultValue={currency} required />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="defaultLowStockThreshold">Umbral de stock bajo por defecto</Label>
          <Input
            id="defaultLowStockThreshold"
            name="defaultLowStockThreshold"
            type="number"
            min={0}
            defaultValue={defaultLowStockThreshold}
            required
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-muted-foreground">Guardado.</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
