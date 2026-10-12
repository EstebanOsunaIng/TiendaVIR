import Link from "next/link";
import { Suspense } from "react";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { CatalogFilters } from "./catalog-filters";

type SearchParams = {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
};

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { q, category, size, color } = await searchParams;
  const store = await getPublicStore(slug);
  if (!store) return null; // el layout ya hizo notFound()

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("store_id", store.id)
    .order("name");

  let query = supabase
    .from("products")
    .select(
      "id, name, base_price, product_images(storage_path, position), product_variants(id, size, color, stock, is_active), categories(slug)",
    )
    .eq("store_id", store.id)
    .eq("is_published", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("categories.slug", category);

  const { data: products } = await query.order("created_at", { ascending: false });

  const visible = (products ?? []).filter((product) => {
    const activeVariants = product.product_variants.filter((v) => v.is_active);
    if (activeVariants.length === 0) return false;
    if (size && !activeVariants.some((v) => v.size === size)) return false;
    if (color && !activeVariants.some((v) => v.color === color)) return false;
    return true;
  });

  const allSizes = Array.from(
    new Set(
      (products ?? []).flatMap((p) => p.product_variants.map((v) => v.size).filter(Boolean)),
    ),
  ) as string[];
  const allColors = Array.from(
    new Set(
      (products ?? []).flatMap((p) => p.product_variants.map((v) => v.color).filter(Boolean)),
    ),
  ) as string[];

  return (
    <div className="flex flex-col gap-6">
      {store.description ? <p className="text-muted-foreground">{store.description}</p> : null}

      <Suspense>
        <CatalogFilters
          storeSlug={slug}
          categories={categories ?? []}
          sizes={allSizes}
          colors={allColors}
        />
      </Suspense>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {visible.map((product) => {
          const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
          const totalStock = product.product_variants
            .filter((v) => v.is_active)
            .reduce((sum, v) => sum + v.stock, 0);

          return (
            <Link
              key={product.id}
              href={`/tienda/${slug}/productos/${product.id}`}
              className="flex flex-col gap-2 rounded-lg border p-3 hover:shadow-sm"
            >
              <div className="aspect-square overflow-hidden rounded-md bg-muted">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URL pública de Supabase Storage
                  <img
                    src={
                      supabase.storage.from("product-images").getPublicUrl(image.storage_path)
                        .data.publicUrl
                    }
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(product.base_price, store.currency)}
              </p>
              {totalStock === 0 ? (
                <p className="text-xs text-destructive">Agotado</p>
              ) : null}
            </Link>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="text-muted-foreground">No encontramos productos con esos filtros.</p>
      ) : null}
    </div>
  );
}
