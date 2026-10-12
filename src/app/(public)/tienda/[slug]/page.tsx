import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/public/hero";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { PackageSearchIcon } from "lucide-react";
import { CatalogFilters } from "./catalog-filters";

type SearchParams = {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
};

const PAGE_SIZE = 24;
const NEW_WITHIN_DAYS = 14;

export default async function CatalogoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const { q, category, size, color, minPrice, maxPrice, sort, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const store = await getPublicStore(slug);
  if (!store) return null; // el layout ya hizo notFound()

  // Server Component async: cada request ya recalcula todo desde cero, no
  // hay memoización de render de la que "impuro" proteja aquí.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("store_id", store.id)
    .order("name");

  let query = supabase
    .from("products")
    .select(
      "id, name, base_price, created_at, product_images(storage_path, position), product_variants(id, size, color, stock, is_active), categories(slug)",
      { count: "exact" },
    )
    .eq("store_id", store.id)
    .eq("is_published", true);

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("categories.slug", category);
  if (minPrice) query = query.gte("base_price", Number(minPrice));
  if (maxPrice) query = query.lte("base_price", Number(maxPrice));

  if (sort === "price_asc") query = query.order("base_price", { ascending: true });
  else if (sort === "price_desc") query = query.order("base_price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  // Talla/color dependen de las variantes activas de cada producto, así que
  // ese filtro se aplica en JS: no se puede paginar en la BD y filtrar por
  // variante a la vez sin perder la cuenta real de resultados. Con ese
  // filtro activo se trae el set completo (ya acotado por búsqueda/categoría/precio)
  // y se pagina sobre el resultado filtrado; sin él, se pagina directo en la BD.
  const hasVariantFilter = Boolean(size || color);
  if (!hasVariantFilter) {
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  }

  const { data: products, count } = await query;

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
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
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

  const isLandingView =
    !q && !category && !size && !color && !minPrice && !maxPrice && !sort && page === 1;

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

      {visible.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visible.map((product) => {
            const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
            const totalStock = product.product_variants
              .filter((v) => v.is_active)
              .reduce((sum, v) => sum + v.stock, 0);
            const isNew =
              now - new Date(product.created_at).getTime() < NEW_WITHIN_DAYS * 24 * 60 * 60 * 1000;

            return (
              <Link
                key={product.id}
                href={`/tienda/${slug}/productos/${product.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-3 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  {image ? (
                    <Image
                      src={
                        supabase.storage.from("product-images").getPublicUrl(image.storage_path)
                          .data.publicUrl
                      }
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  {totalStock === 0 ? (
                    <div className="absolute left-2 top-2">
                      <StatusBadge status="sold-out" />
                    </div>
                  ) : isNew ? (
                    <div className="absolute left-2 top-2">
                      <StatusBadge status="new" />
                    </div>
                  ) : null}
                </div>
                <p className="text-sm font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(product.base_price, store.currency)}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={PackageSearchIcon}
          title="No encontramos productos"
          description="Prueba quitando algún filtro o buscando con otras palabras."
        />
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-4 pt-2 text-sm">
          <Button variant="outline" size="sm" disabled={page <= 1} render={<Link href={pageHref(page - 1)} />}>
            Anterior
          </Button>
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            render={<Link href={pageHref(page + 1)} />}
          >
            Siguiente
          </Button>
        </div>
      ) : null}
    </div>
  );
}
