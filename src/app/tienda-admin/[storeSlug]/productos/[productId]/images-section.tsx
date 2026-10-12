"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { addProductImage } from "@/actions/products/add-product-image";
import { deleteProductImage } from "@/actions/products/delete-product-image";

type ProductImage = { id: string; storage_path: string; position: number };

export function ImagesSection({
  storeSlug,
  storeId,
  productId,
  images,
}: {
  storeSlug: string;
  storeId: string;
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      let nextPosition = images.length;

      for (const file of Array.from(files)) {
        const path = `${storeId}/${productId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);

        if (uploadError) {
          setError(`No se pudo subir ${file.name}`);
          continue;
        }

        const result = await addProductImage(storeSlug, productId, path, nextPosition);
        if (!result.ok) {
          setError(result.error);
        }
        nextPosition += 1;
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    });
  }

  function handleDelete(imageId: string) {
    startTransition(async () => {
      await deleteProductImage(storeSlug, imageId);
      router.refresh();
    });
  }

  function publicUrl(path: string) {
    return createClient().storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Fotos</h2>
      <div className="flex flex-wrap gap-3">
        {images.map((image) => (
          <div key={image.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- public Supabase Storage URL, no need for next/image optimization */}
            <img
              src={publicUrl(image.storage_path)}
              alt=""
              className="h-24 w-24 rounded-md border object-cover"
            />
            <Button
              variant="destructive"
              size="icon-sm"
              className="absolute -right-2 -top-2"
              disabled={isPending}
              onClick={() => handleDelete(image.id)}
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={isPending}
        onChange={(e) => handleFilesSelected(e.target.files)}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
