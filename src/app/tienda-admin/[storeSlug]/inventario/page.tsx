import Link from "next/link";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { AdjustStockDialog } from "./adjust-stock-dialog";

export default async function InventarioPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, size, color, stock, is_active, products(name, low_stock_threshold)")
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Inventario</h1>
        <Link
          href={`/tienda-admin/${storeSlug}/inventario/movimientos`}
          className="text-sm underline"
        >
          Ver historial de movimientos
        </Link>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {variants?.map((variant) => {
          const threshold = variant.products?.low_stock_threshold ?? context.defaultLowStockThreshold;
          const isLow = variant.stock <= threshold;
          const label = [variant.products?.name, variant.sku, variant.size, variant.color]
            .filter(Boolean)
            .join(" · ");

          return (
            <li key={variant.id} className="flex items-center justify-between border-b py-2">
              <div>
                <p>{label}</p>
                <p className="text-xs text-muted-foreground">
                  stock: {variant.stock}
                  {variant.is_active ? "" : " · inactiva"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isLow ? <Badge variant="destructive">Stock bajo</Badge> : null}
                <AdjustStockDialog storeSlug={storeSlug} variantId={variant.id} variantLabel={label} />
              </div>
            </li>
          );
        })}
        {variants?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay variantes de producto.</li>
        ) : null}
      </ul>
    </div>
  );
}
