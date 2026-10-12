import { requireStoreOwner } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function ConfiguracionPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreOwner(storeSlug);
  const supabase = await createClient();

  const [{ data: store }, { data: settings }] = await Promise.all([
    supabase
      .from("stores")
      .select("description, logo_url, cover_image_url, whatsapp_number")
      .eq("id", context.storeId)
      .single(),
    supabase
      .from("store_settings")
      .select("currency, default_low_stock_threshold")
      .eq("store_id", context.storeId)
      .single(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-xl">Configuración de {context.storeName}</h1>
      <SettingsForm
        storeSlug={storeSlug}
        storeId={context.storeId}
        description={store?.description ?? null}
        logoUrl={store?.logo_url ?? null}
        coverImageUrl={store?.cover_image_url ?? null}
        whatsappNumber={store?.whatsapp_number ?? null}
        currency={settings?.currency ?? "USD"}
        defaultLowStockThreshold={settings?.default_low_stock_threshold ?? 5}
      />
    </div>
  );
}
