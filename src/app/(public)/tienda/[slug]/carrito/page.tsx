import { notFound } from "next/navigation";
import { getPublicStore } from "@/lib/catalog/get-public-store";
import { CheckoutForm } from "./checkout-form";

export default async function CarritoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await getPublicStore(slug);
  if (!store) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-medium">Tu carrito</h1>
      <CheckoutForm
        storeId={store.id}
        storeName={store.name}
        whatsappNumber={store.whatsappNumber}
        currency={store.currency}
      />
    </div>
  );
}
