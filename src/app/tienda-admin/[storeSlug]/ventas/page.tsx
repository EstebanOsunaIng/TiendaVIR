import Link from "next/link";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";

export default async function VentasPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: sales } = await supabase
    .from("sales")
    .select(
      "id, total_amount, notes, created_at, sale_items(quantity, product_variants(sku, products(name)))",
    )
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Ventas</h1>
        <Button render={<Link href={`/tienda-admin/${storeSlug}/ventas/nueva`} />}>
          Nueva venta
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        {sales?.map((sale) => (
          <li key={sale.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {new Date(sale.created_at).toLocaleString()}
              </p>
              <p className="font-medium">{formatCurrency(sale.total_amount, context.currency)}</p>
            </div>
            <ul className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
              {sale.sale_items.map((item, i) => (
                <li key={i}>
                  {item.product_variants?.products?.name} ({item.product_variants?.sku}) x
                  {item.quantity}
                </li>
              ))}
            </ul>
            {sale.notes ? <p className="mt-1 text-sm">Nota: {sale.notes}</p> : null}
          </li>
        ))}
        {sales?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay ventas registradas.</li>
        ) : null}
      </ul>
    </div>
  );
}
