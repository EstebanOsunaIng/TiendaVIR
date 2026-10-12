import Link from "next/link";
import { Suspense } from "react";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { Hero } from "@/components/public/hero";
import { CatalogFilters } from "./catalog-filters";

type SearchParams = {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
  page?: string;
};

const PAGE_SIZE = 24;

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { q, category, size, color, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
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
      { count: "exact" },
    )
    .eq("store_id", store.id)
    .eq("is_published", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("categories.slug", category);

  // Talla/color dependen de las variantes activas de cada producto, así que
  // ese filtro se aplica en JS: no se puede paginar en la BD y filtrar por
  // variante a la vez sin perder la cuenta real de resultados. Con ese
  // filtro activo se trae el set completo (ya acotado por búsqueda/categoría)
  // y se pagina sobre el resultado filtrado; sin él, se pagina directo en la BD.
  const hasVariantFilter = Boolean(size || color);
  if (!hasVariantFilter) {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  }

  const { data: products, count } = await query.order("created_at", { ascending: false });

  const filtered = (products ?? []).filter((product) => {
    const activeVariants = product.product_variants.filter((v) => v.is_active);
    if (activeVariants.length === 0) return false;
    if (size && !activeVariants.some((v) => v.size === size)) return false;
    if (color && !activeVariants.some((v) => v.color === color)) return false;
    return true;
  });

  const totalPages = hasVariantFilter
    ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
    : Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const visible = hasVariantFilter
    ? filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : filtered;

  function pageHref(targetPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (size) params.set("size", size);
    if (color) params.set("color", color);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/tienda/${slug}${qs ? `?${qs}` : ""}`;
  }

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

  const isLandingView = !q && !category && !size && !color && page === 1;

  return (
    <div className="flex flex-col gap-6">
      {isLandingView ? (
        <Hero storeName={store.name} description={store.description} coverImageUrl={store.coverImageUrl} />
      ) : null}

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

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4 text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="underline">
              Anterior
            </Link>
          ) : (
            <span className="text-muted-foreground">Anterior</span>
          )}
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="underline">
              Siguiente
            </Link>
          ) : (
            <span className="text-muted-foreground">Siguiente</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
