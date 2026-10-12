import { requireStoreOwner } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";

export default async function ReportesPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreOwner(storeSlug);
  const supabase = await createClient();

  const { data: sales } = await supabase
    .from("sales")
    .select("total_amount, created_at, sale_items(quantity, subtotal, product_variants(products(name)))")
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false });

  const totalRevenue = (sales ?? []).reduce((sum, s) => sum + s.total_amount, 0);
  const totalSales = sales?.length ?? 0;
  const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

  const revenueByDay = new Map<string, number>();
  const revenueByProduct = new Map<string, { revenue: number; quantity: number }>();
  for (const sale of sales ?? []) {
    const day = sale.created_at.slice(0, 10);
    revenueByDay.set(day, (revenueByDay.get(day) ?? 0) + sale.total_amount);
    for (const item of sale.sale_items) {
      const name = item.product_variants?.products?.name ?? "Producto";
      const current = revenueByProduct.get(name) ?? { revenue: 0, quantity: 0 };
      revenueByProduct.set(name, {
        revenue: current.revenue + item.subtotal,
        quantity: current.quantity + item.quantity,
      });
    }
  }

  const last30Days = Array.from(revenueByDay.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, 30);

  const topProducts = Array.from(revenueByProduct.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Reportes financieros</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{formatCurrency(totalRevenue, context.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ventas totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ticket promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-medium">{formatCurrency(averageSale, context.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ingresos por día (últimos 30 registrados)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm">
            {last30Days.map(([day, revenue]) => (
              <li key={day} className="flex justify-between">
                <span>{day}</span>
                <span>{formatCurrency(revenue, context.currency)}</span>
              </li>
            ))}
            {last30Days.length === 0 ? (
              <li className="text-muted-foreground">Todavía no hay ventas.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos más vendidos (todo el tiempo)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1 text-sm">
            {topProducts.map(([name, data]) => (
              <li key={name} className="flex justify-between">
                <span>
                  {name} ({data.quantity} unidades)
                </span>
                <span>{formatCurrency(data.revenue, context.currency)}</span>
              </li>
            ))}
            {topProducts.length === 0 ? (
              <li className="text-muted-foreground">Todavía no hay ventas.</li>
            ) : null}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
