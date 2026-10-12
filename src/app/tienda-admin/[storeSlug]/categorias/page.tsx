import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "./category-form";
import { DeleteCategoryButton } from "./delete-category-button";

export default async function CategoriasPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("store_id", context.storeId)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Categorías</h1>
      <CategoryForm storeSlug={storeSlug} />
      <ul className="flex flex-col gap-1 text-sm">
        {categories?.map((category) => (
          <li key={category.id} className="flex items-center justify-between border-b py-2">
            {category.name}
            <DeleteCategoryButton storeSlug={storeSlug} categoryId={category.id} />
          </li>
        ))}
        {categories?.length === 0 ? (
          <li className="text-muted-foreground">Todavía no hay categorías.</li>
        ) : null}
      </ul>
    </div>
  );
}
