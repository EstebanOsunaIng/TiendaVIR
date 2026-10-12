"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateStoreSettings } from "@/actions/store/update-settings";
import { BrandImageField } from "./brand-image-field";

export function SettingsForm({
  storeSlug,
  storeId,
  description,
  logoUrl,
  coverImageUrl,
  whatsappNumber,
  currency,
  defaultLowStockThreshold,
}: {
  storeSlug: string;
  storeId: string;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
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
    <form action={handleSubmit} className="flex max-w-xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Identidad de la tienda</CardTitle>
          <CardDescription>Logo y portada del catálogo público.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <BrandImageField
            storeId={storeId}
            name="logoUrl"
            label="Logo"
            helpText="Se muestra en el encabezado del catálogo público."
            initialUrl={logoUrl}
            aspectClassName="aspect-square w-20"
          />
          <BrandImageField
            storeId={storeId}
            name="coverImageUrl"
            label="Portada"
            helpText="Foto de fondo de la página principal del catálogo. Si no la configuras, se muestra una portada tipográfica."
            initialUrl={coverImageUrl}
            aspectClassName="aspect-video w-56"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción pública</Label>
            <Input id="description" name="description" defaultValue={description ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>A dónde llegan las solicitudes de pedido.</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Moneda e inventario</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-success">Guardado.</p> : null}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
