import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type PublicStore = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  whatsappNumber: string | null;
  currency: string;
};

/** Resuelve una tienda activa por slug para el catálogo público, o null. */
export const getPublicStore = cache(async (storeSlug: string): Promise<PublicStore | null> => {
  const supabase = await createClient();
  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug, description, logo_url, whatsapp_number, is_active, store_settings(currency)")
    .eq("slug", storeSlug)
    .eq("is_active", true)
    .single();

  if (!store) return null;

  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description,
    logoUrl: store.logo_url,
    whatsappNumber: store.whatsapp_number,
    currency: store.store_settings?.currency ?? "USD",
  };
});
