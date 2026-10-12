import { HistoryIcon } from "lucide-react";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";

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
      <h1 className="font-heading text-xl">Historial de movimientos</h1>
      {movements && movements.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="whitespace-normal">
                  {movement.product_variants?.products?.name} · {movement.product_variants?.sku}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {MOVEMENT_LABELS[movement.type] ?? movement.type}
                  {movement.note ? ` — ${movement.note}` : ""}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${movement.quantity < 0 ? "text-destructive" : "text-success"}`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(movement.created_at).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState icon={HistoryIcon} title="Todavía no hay movimientos de inventario" />
      )}
    </div>
  );
}
