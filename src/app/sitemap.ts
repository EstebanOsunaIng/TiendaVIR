import type { MetadataRoute } from "next";
import { createPublicClient } from "@/lib/supabase/public";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = createPublicClient();

  const { data: stores } = await supabase
    .from("stores")
    .select("slug, updated_at, products(id, updated_at, is_published)")
    .eq("is_active", true);

  const entries: MetadataRoute.Sitemap = [];

  for (const store of stores ?? []) {
    entries.push({
      url: `${siteUrl}/tienda/${store.slug}`,
      lastModified: store.updated_at ?? undefined,
    });

    for (const product of store.products ?? []) {
      if (!product.is_published) continue;
      entries.push({
        url: `${siteUrl}/tienda/${store.slug}/productos/${product.id}`,
        lastModified: product.updated_at ?? undefined,
      });
    }
  }

  return entries;
}
