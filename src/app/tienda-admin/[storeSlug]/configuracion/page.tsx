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
    supabase.from("stores").select("description, whatsapp_number").eq("id", context.storeId).single(),
    supabase
      .from("store_settings")
      .select("currency, default_low_stock_threshold")
      .eq("store_id", context.storeId)
      .single(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Configuración de {context.storeName}</h1>
      <SettingsForm
        storeSlug={storeSlug}
        description={store?.description ?? null}
        whatsappNumber={store?.whatsapp_number ?? null}
        currency={settings?.currency ?? "USD"}
        defaultLowStockThreshold={settings?.default_low_stock_threshold ?? 5}
      />
    </div>
  );
}
