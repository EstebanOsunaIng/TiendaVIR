import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { CartProvider } from "@/components/public/cart-context";
import { CartLink } from "./cart-link";

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

  return (
    <CartProvider storeSlug={slug}>
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <Link href={`/tienda/${slug}`} className="font-medium">
            {store.name}
          </Link>
          <CartLink storeSlug={slug} />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </CartProvider>
  );
}
