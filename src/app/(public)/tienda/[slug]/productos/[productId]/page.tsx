import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { AddToCart } from "./add-to-cart";
import { ProductGallery } from "./product-gallery";

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

  const images = [...product.product_images]
    .sort((a, b) => a.position - b.position)
    .map((image) => supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl);
  const mainImage = images[0] ?? null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ProductGallery images={images} alt={product.name} />
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-2xl">{product.name}</h1>
        {product.description ? (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        ) : null}
        <AddToCart
          storeSlug={slug}
          productId={product.id}
          productName={product.name}
          imageUrl={mainImage}
          currency={store.currency}
          variants={activeVariants}
        />
      </div>
    </div>
  );
}
