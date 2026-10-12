import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";

const MOVEMENT_LABELS: Record<string, string> = {
  purchase: "Compra",
  adjustment: "Ajuste",
  sale: "Venta",
  return: "Devolución",
};

export default async function MovimientosPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("id, type, quantity, note, created_at, product_variants(sku, products(name))")
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Historial de movimientos</h1>
      <ul className="flex flex-col gap-1 text-sm">
        {movements?.map((movement) => (
          <li key={movement.id} className="flex items-center justify-between border-b py-2">
            <div>
              <p>
                {movement.product_variants?.products?.name} · {movement.product_variants?.sku}
              </p>
              <p className="text-xs text-muted-foreground">
                {MOVEMENT_LABELS[movement.type] ?? movement.type}
                {movement.note ? ` — ${movement.note}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className={movement.quantity < 0 ? "text-destructive" : "text-foreground"}>
                {movement.quantity > 0 ? "+" : ""}
                {movement.quantity}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(movement.created_at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
        {movements?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay movimientos de inventario.</li>
        ) : null}
      </ul>
    </div>
  );
}
