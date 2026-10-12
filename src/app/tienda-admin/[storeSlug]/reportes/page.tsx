import { BarChart3Icon, ReceiptIcon, TicketIcon, WalletIcon } from "lucide-react";
import { requireStoreOwner } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart } from "@/components/admin/bar-chart";
import { EmptyState } from "@/components/shared/empty-state";
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
      <h1 className="font-heading text-xl">Reportes financieros</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="size-4 text-muted-foreground" />
              Ingresos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{formatCurrency(totalRevenue, context.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptIcon className="size-4 text-muted-foreground" />
              Ventas totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{totalSales}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketIcon className="size-4 text-muted-foreground" />
              Ticket promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl">{formatCurrency(averageSale, context.currency)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-4 text-muted-foreground" />
            Ingresos por día (últimos 30 registrados)
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {last30Days.length > 0 ? (
            <>
              <BarChart
                data={[...last30Days].reverse().map(([day, revenue]) => ({ label: day, value: revenue }))}
                formatValue={(v) => formatCurrency(v, context.currency)}
              />
              <Table>
                <TableBody>
                  {last30Days.map(([day, revenue]) => (
                    <TableRow key={day}>
                      <TableCell className="text-muted-foreground">{day}</TableCell>
                      <TableCell className="text-right">{formatCurrency(revenue, context.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Todavía no hay ventas.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Productos más vendidos (todo el tiempo)</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map(([name, data]) => (
                  <TableRow key={name}>
                    <TableCell className="whitespace-normal">{name}</TableCell>
                    <TableCell className="text-right">{data.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(data.revenue, context.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={BarChart3Icon} title="Todavía no hay ventas" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
