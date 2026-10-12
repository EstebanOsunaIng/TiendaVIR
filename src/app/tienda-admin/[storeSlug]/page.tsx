import Link from "next/link";
import { AlertTriangleIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
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
      <h1 className="font-heading text-2xl">{context.storeName}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="size-4 text-muted-foreground" />
              Ventas (30 días)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{formatCurrency(salesTotal, context.currency)}</p>
            <p className="text-sm text-muted-foreground">{salesCount} ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangleIcon className="size-4 text-muted-foreground" />
              Stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{lowStockVariants.length}</p>
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-muted-foreground" />
              Rol
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{context.role === "owner" ? "Propietario" : "Empleado"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas de stock bajo</CardTitle>
        </CardHeader>
        <CardContent>
          {lowStockVariants.length > 0 ? (
            <Table>
              <TableBody>
                {lowStockVariants.slice(0, 10).map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="whitespace-normal">{v.products?.name}</TableCell>
                    <TableCell className="text-right text-destructive">stock: {v.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">Ningún producto está por debajo de su umbral.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos más vendidos (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map(([name, revenue]) => (
                  <TableRow key={name}>
                    <TableCell className="whitespace-normal">{name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(revenue, context.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={TrendingUpIcon}
              title="Todavía no hay ventas registradas"
              description="Cuando registres ventas, aquí verás los productos más vendidos."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
