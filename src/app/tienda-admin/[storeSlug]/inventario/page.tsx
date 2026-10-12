import Link from "next/link";
import { BoxesIcon, HistoryIcon } from "lucide-react";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdjustStockDialog } from "./adjust-stock-dialog";

export default async function InventarioPage({
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
    .from("product_variants")
    .select("id, sku, size, color, stock, is_active, products(name, low_stock_threshold)")
    .eq("store_id", context.storeId);

  if (q) query = query.ilike("sku", `%${q}%`);

  const { data: variants } = await query.order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl">Inventario</h1>
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/tienda-admin/${storeSlug}/inventario/movimientos`} />}
        >
          <HistoryIcon />
          Historial de movimientos
        </Button>
      </div>

      <AdminSearchInput
        basePath={`/tienda-admin/${storeSlug}/inventario`}
        placeholder="Buscar por SKU..."
      />

      {variants && variants.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead></TableHead>
              <TableHead className="w-28"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants.map((variant) => {
              const threshold = variant.products?.low_stock_threshold ?? context.defaultLowStockThreshold;
              const isLow = variant.stock <= threshold;
              const label = [variant.products?.name, variant.size, variant.color].filter(Boolean).join(" · ");

              return (
                <TableRow key={variant.id}>
                  <TableCell className="whitespace-normal">
                    {label}
                    {!variant.is_active ? (
                      <span className="ml-1.5 text-xs text-muted-foreground">(inactiva)</span>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{variant.sku}</TableCell>
                  <TableCell className="text-right">{variant.stock}</TableCell>
                  <TableCell>{isLow ? <StatusBadge status="low-stock" /> : null}</TableCell>
                  <TableCell>
                    <AdjustStockDialog storeSlug={storeSlug} variantId={variant.id} variantLabel={label} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={BoxesIcon}
          title={q ? "Sin resultados" : "Todavía no hay variantes de producto"}
          description={q ? "Prueba con otro término de búsqueda." : undefined}
        />
      )}
    </div>
  );
}
