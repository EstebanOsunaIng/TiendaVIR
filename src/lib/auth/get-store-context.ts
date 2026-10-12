import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { StoreRole } from "@/lib/constants";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "@/lib/constants";

export type StoreContext = {
  storeId: string;
  storeSlug: string;
  storeName: string;
  role: StoreRole;
  userId: string;
  currency: string;
  defaultLowStockThreshold: number;
};

/**
 * Resuelve storeSlug -> tienda + rol del usuario actual, o null si no hay
 * sesión o no es miembro de esa tienda. `cache()` memoiza por request, así
 * que el layout y las páginas hijas que llamen esto para el mismo slug no
 * repiten la consulta.
 */
export const getStoreContext = cache(
  async (storeSlug: string): Promise<StoreContext | null> => {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: store } = await supabase
      .from("stores")
      .select("id, name, slug")
      .eq("slug", storeSlug)
      .single();
    if (!store) return null;

    const [{ data: membership }, { data: settings }] = await Promise.all([
      supabase
        .from("store_members")
        .select("role")
        .eq("store_id", store.id)
        .eq("user_id", userData.user.id)
        .maybeSingle(),
      supabase
        .from("store_settings")
        .select("currency, default_low_stock_threshold")
        .eq("store_id", store.id)
        .maybeSingle(),
    ]);
    if (!membership) return null;

    return {
      storeId: store.id,
      storeSlug: store.slug,
      storeName: store.name,
      role: membership.role,
      userId: userData.user.id,
      currency: settings?.currency ?? "USD",
      defaultLowStockThreshold: settings?.default_low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
    };
  },
);
