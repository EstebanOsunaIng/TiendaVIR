import Link from "next/link";
import Image from "next/image";
import { PackageIcon } from "lucide-react";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminSearchInput } from "@/components/admin/search-input";
import { formatCurrency } from "@/lib/currency";

export default async function ProductosPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { storeSlug } = await params;
  const { q } = await searchParams;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, base_price, is_published, categories(name), product_images(storage_path, position)")
    .eq("store_id", context.storeId);

  if (q) query = query.ilike("name", `%${q}%`);

  const { data: products } = await query.order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-xl">Productos</h1>
        <Button render={<Link href={`/tienda-admin/${storeSlug}/productos/nuevo`} />}>
          Nuevo producto
        </Button>
      </div>

      <AdminSearchInput basePath={`/tienda-admin/${storeSlug}/productos`} placeholder="Buscar por nombre..." />

      {products && products.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
              const imageUrl = image
                ? supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl
                : null;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                      {imageUrl ? (
                        <Image src={imageUrl} alt="" fill sizes="40px" className="object-cover" />
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <Link
                      href={`/tienda-admin/${storeSlug}/productos/${product.id}`}
                      className="font-medium hover:underline"
                    >
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.categories?.name ?? "Sin categoría"}
                  </TableCell>
                  <TableCell>{formatCurrency(product.base_price, context.currency)}</TableCell>
                  <TableCell>
                    <StatusBadge status={product.is_published ? "published" : "hidden"} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={PackageIcon}
          title={q ? "Sin resultados" : "Todavía no hay productos"}
          description={
            q ? "Prueba con otro término de búsqueda." : "Crea tu primer producto para comenzar."
          }
          action={
            q ? undefined : (
              <Button size="sm" render={<Link href={`/tienda-admin/${storeSlug}/productos/nuevo`} />}>
                Nuevo producto
              </Button>
            )
          }
        />
      )}
    </div>
  );
}
