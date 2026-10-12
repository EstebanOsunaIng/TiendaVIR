import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { createClient } from "@/lib/supabase/server";
import { CartProvider } from "@/components/public/cart-context";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const store = await getPublicStore(slug);
  if (!store) return {};

  const description = store.description ?? `Catálogo de ${store.name}.`;
  const ogImage = store.coverImageUrl ?? store.logoUrl;
  return {
    title: store.name,
    description,
    openGraph: {
      title: store.name,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function TiendaPublicaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getPublicStore(slug);
  if (!store) notFound();

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, name")
    .eq("store_id", store.id)
    .order("name");

  return (
    <CartProvider storeSlug={slug}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader
          storeSlug={slug}
          storeName={store.name}
          logoUrl={store.logoUrl}
          categories={categories ?? []}
        />
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
          {children}
        </main>
        <SiteFooter
          storeSlug={slug}
          storeName={store.name}
          description={store.description}
          whatsappNumber={store.whatsappNumber}
          categories={categories ?? []}
        />
      </div>
    </CartProvider>
  );
}
