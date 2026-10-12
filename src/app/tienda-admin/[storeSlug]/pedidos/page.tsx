import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { StatusSelect } from "./status-select";

export default async function PedidosPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: orderRequests } = await supabase
    .from("order_requests")
    .select(
      "id, customer_name, customer_phone, customer_note, status, total_estimate, created_at, order_request_items(quantity, unit_price_snapshot, product_variants(sku, size, color, products(name)))",
    )
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Pedidos</h1>
      <ul className="flex flex-col gap-4">
        {orderRequests?.map((request) => (
          <li key={request.id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{request.customer_name}</p>
                <p className="text-sm text-muted-foreground">{request.customer_phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-medium">{formatCurrency(request.total_estimate, context.currency)}</p>
                <StatusSelect storeSlug={storeSlug} orderRequestId={request.id} status={request.status} />
              </div>
            </div>
            {request.customer_note ? (
              <p className="mt-2 text-sm text-muted-foreground">Nota: {request.customer_note}</p>
            ) : null}
            <ul className="mt-3 flex flex-col gap-1 text-sm">
              {request.order_request_items.map((item, i) => (
                <li key={i}>
                  {item.product_variants?.products?.name}{" "}
                  {[item.product_variants?.size, item.product_variants?.color]
                    .filter(Boolean)
                    .join(" / ")}{" "}
                  x{item.quantity} — {formatCurrency(item.unit_price_snapshot * item.quantity, context.currency)}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {orderRequests?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay pedidos.</li>
        ) : null}
      </ul>
    </div>
  );
}
