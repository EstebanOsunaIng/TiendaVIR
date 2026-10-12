import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { NewProductForm } from "./new-product-form";

export default async function NuevoProductoPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("store_id", context.storeId)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl">Nuevo producto</h1>
      <NewProductForm storeSlug={storeSlug} categories={categories ?? []} />
    </div>
  );
}
