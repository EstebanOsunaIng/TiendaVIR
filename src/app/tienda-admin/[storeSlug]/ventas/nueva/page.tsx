import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { NewSaleForm } from "./new-sale-form";

export default async function NuevaVentaPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, sku, size, color, stock, price_override, products(name, base_price)")
    .eq("store_id", context.storeId)
    .eq("is_active", true)
    .order("sku");

  const available = (variants ?? []).map((v) => ({
    id: v.id,
    sku: v.sku,
    size: v.size,
    color: v.color,
    stock: v.stock,
    unitPrice: v.price_override ?? v.products?.base_price ?? 0,
    productName: v.products?.name ?? "",
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl">Nueva venta</h1>
      <NewSaleForm storeSlug={storeSlug} variants={available} currency={context.currency} />
    </div>
  );
}
