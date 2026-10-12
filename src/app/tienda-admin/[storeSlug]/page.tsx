import Link from "next/link";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

export default async function DashboardHomePage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  // Server Component async: cada request ya recalcula todo desde cero, no
  // hay memoización de render de la que "impuro" proteja aquí.
  // eslint-disable-next-line react-hooks/purity
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: recentSales }, { data: variants }] = await Promise.all([
    supabase
      .from("sales")
      .select("total_amount, created_at, sale_items(quantity, subtotal, product_variants(products(name)))")
      .eq("store_id", context.storeId)
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("product_variants")
      .select("stock, is_active, products(name, low_stock_threshold)")
      .eq("store_id", context.storeId),
  ]);

  const salesTotal = (recentSales ?? []).reduce((sum, s) => sum + s.total_amount, 0);
  const salesCount = recentSales?.length ?? 0;

  const revenueByProduct = new Map<string, number>();
  for (const sale of recentSales ?? []) {
    for (const item of sale.sale_items) {
      const name = item.product_variants?.products?.name ?? "Producto";
      revenueByProduct.set(name, (revenueByProduct.get(name) ?? 0) + item.subtotal);
    }
  }
  const topProducts = Array.from(revenueByProduct.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const lowStockVariants = (variants ?? []).filter(
    (v) => v.is_active && v.stock <= (v.products?.low_stock_threshold ?? context.defaultLowStockThreshold),
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-medium">{context.storeName}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ventas (30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{formatCurrency(salesTotal, context.currency)}</p>
            <p className="text-sm text-muted-foreground">{salesCount} ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{lowStockVariants.length}</p>
            <Link
              href={`/tienda-admin/${storeSlug}/inventario`}
              className="text-sm text-muted-foreground underline"
            >
              Ver inventario
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rol</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge>{context.role === "owner" ? "Propietario" : "Empleado"}</Badge>
          </CardContent>
        </Card>
      </div>

      {lowStockVariants.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Alertas de stock bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm">
              {lowStockVariants.slice(0, 10).map((v, i) => (
                <li key={i}>
                  {v.products?.name} — stock: {v.stock}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {topProducts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Productos más vendidos (30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-1 text-sm">
              {topProducts.map(([name, revenue]) => (
                <li key={name} className="flex justify-between">
                  <span>{name}</span>
                  <span>{formatCurrency(revenue, context.currency)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
