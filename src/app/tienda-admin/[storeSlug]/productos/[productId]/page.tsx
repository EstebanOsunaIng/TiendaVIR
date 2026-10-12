import { notFound } from "next/navigation";
import { requireStoreMember } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditProductForm } from "./edit-product-form";
import { VariantsSection } from "./variants-section";
import { ImagesSection } from "./images-section";
import { DeleteProductButton } from "./delete-product-button";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ storeSlug: string; productId: string }>;
}) {
  const { storeSlug, productId } = await params;
  const context = await requireStoreMember(storeSlug);
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("id, name, description, category_id, base_price, is_published")
    .eq("id", productId)
    .eq("store_id", context.storeId)
    .single();

  if (!product) notFound();

  const [{ data: categories }, { data: variants }, { data: images }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("store_id", context.storeId).order("name"),
    supabase
      .from("product_variants")
      .select("id, sku, size, color, stock, is_active")
      .eq("product_id", productId)
      .order("created_at"),
    supabase
      .from("product_images")
      .select("id, storage_path, position")
      .eq("product_id", productId)
      .order("position"),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl">{product.name}</h1>
        <DeleteProductButton storeSlug={storeSlug} productId={productId} productName={product.name} />
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">Información básica</TabsTrigger>
          <TabsTrigger value="variants">Variantes</TabsTrigger>
          <TabsTrigger value="images">Imágenes</TabsTrigger>
        </TabsList>
        <TabsContent value="info" className="pt-6">
          <EditProductForm storeSlug={storeSlug} product={product} categories={categories ?? []} />
        </TabsContent>
        <TabsContent value="variants" className="pt-6">
          <VariantsSection storeSlug={storeSlug} productId={productId} variants={variants ?? []} />
        </TabsContent>
        <TabsContent value="images" className="pt-6">
          <ImagesSection
            storeSlug={storeSlug}
            storeId={context.storeId}
            productId={productId}
            images={images ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
