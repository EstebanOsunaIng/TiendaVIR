import Link from "next/link";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";

export default async function ProductosPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, base_price, is_published, categories(name)")
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">Productos</h1>
        <Button render={<Link href={`/tienda-admin/${storeSlug}/productos/nuevo`} />}>
          Nuevo producto
        </Button>
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {products?.map((product) => (
          <li key={product.id} className="flex items-center justify-between border-b py-2">
            <div>
              <Link
                href={`/tienda-admin/${storeSlug}/productos/${product.id}`}
                className="font-medium hover:underline"
              >
                {product.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {product.categories?.name ?? "Sin categoría"} · {formatCurrency(product.base_price, context.currency)}
              </p>
            </div>
            <Badge variant={product.is_published ? "default" : "secondary"}>
              {product.is_published ? "Publicado" : "Oculto"}
            </Badge>
          </li>
        ))}
        {products?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay productos.</li>
        ) : null}
      </ul>
    </div>
  );
}
