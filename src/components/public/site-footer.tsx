import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";

type Category = { slug: string; name: string };

/** Enlace genérico "contáctanos" — build-wa-link.ts es específico del carrito (arma el resumen de la compra), no aplica aquí. */
function buildGenericWaLink(whatsappNumber: string, storeName: string): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  const text = `Hola, tengo una pregunta sobre ${storeName}.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function SiteFooter({
  storeSlug,
  storeName,
  description,
  whatsappNumber,
  categories,
}: {
  storeSlug: string;
  storeName: string;
  description: string | null;
  whatsappNumber: string | null;
  categories: Category[];
}) {
  const waLink = whatsappNumber ? buildGenericWaLink(whatsappNumber, storeName) : null;

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-lg">{storeName}</p>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>

        {categories.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Categorías</p>
            <ul className="flex flex-col gap-1.5">
              {categories.slice(0, 6).map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/tienda/${storeSlug}?category=${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Contacto</p>
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <MessageCircleIcon className="size-4" />
              WhatsApp
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">Sin canal de contacto configurado.</p>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground sm:px-6">
        {storeName} · Catálogo gestionado con TiendaVit
      </div>
    </footer>
  );
}
