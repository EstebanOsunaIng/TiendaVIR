"use client";

import { useRef, useState, useTransition } from "react";
import { ImageIcon, XIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function BrandImageField({
  storeId,
  name,
  label,
  helpText,
  initialUrl,
  aspectClassName = "aspect-square w-32",
}: {
  storeId: string;
  name: string;
  label: string;
  helpText?: string;
  initialUrl: string | null;
  aspectClassName?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelected(file: File | undefined) {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const path = `${storeId}/branding/${name}-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file);

      if (uploadError) {
        setError("No se pudo subir la imagen");
        return;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setUrl(data.publicUrl);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted ${aspectClassName}`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL pública de Supabase Storage
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={isPending}
            onChange={(e) => handleFileSelected(e.target.files?.[0])}
            className="text-sm"
          />
          {url ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-fit"
              onClick={() => setUrl("")}
            >
              <XIcon />
              Quitar imagen
            </Button>
          ) : null}
        </div>
      </div>
      {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <input type="hidden" name={name} value={url} />
    </div>
  );
}
