import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { AddToCart } from "./add-to-cart";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}): Promise<Metadata> {
  const { slug, productId } = await params;
  const store = await getPublicStore(slug);
  if (!store) return {};

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, base_price, product_images(storage_path, position)")
    .eq("id", productId)
    .eq("store_id", store.id)
    .eq("is_published", true)
    .single();

  if (!product) return {};

  const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
  const imageUrl = image
    ? supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl
    : undefined;
  const description =
    product.description ?? `${product.name} — ${formatCurrency(product.base_price, store.currency)}`;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ProductoPublicoPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>;
}) {
  const { slug, productId } = await params;
  const store = await getPublicStore(slug);
  if (!store) notFound();

  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, name, description, base_price, is_published, product_images(storage_path, position), product_variants(id, sku, size, color, price_override, stock, is_active)",
    )
    .eq("id", productId)
    .eq("store_id", store.id)
    .eq("is_published", true)
    .single();

  if (!product) notFound();

  const activeVariants = product.product_variants
    .filter((v) => v.is_active)
    .map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      stock: v.stock,
      unitPrice: v.price_override ?? product.base_price,
    }));

  if (activeVariants.length === 0) notFound();

  const images = [...product.product_images].sort((a, b) => a.position - b.position);
  const mainImage = images[0]
    ? supabase.storage.from("product-images").getPublicUrl(images[0].storage_path).data.publicUrl
    : null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL pública de Supabase Storage
          <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
        ) : null}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-medium">{product.name}</h1>
        <p className="text-lg">{formatCurrency(product.base_price, store.currency)}</p>
        {product.description ? (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        ) : null}
        <AddToCart
          storeSlug={slug}
          productId={product.id}
          productName={product.name}
          imageUrl={mainImage}
          variants={activeVariants}
        />
      </div>
    </div>
  );
}
