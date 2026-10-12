import Link from "next/link";
import Image from "next/image";
import { SearchIcon } from "lucide-react";
import { CartLink } from "@/app/(public)/tienda/[slug]/cart-link";
import { PublicMobileNav } from "./public-mobile-nav";

type Category = { slug: string; name: string };

export function SiteHeader({
  storeSlug,
  storeName,
  logoUrl,
  categories,
}: {
  storeSlug: string;
  storeName: string;
  logoUrl: string | null;
  categories: Category[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <PublicMobileNav storeSlug={storeSlug} categories={categories} />

        <Link href={`/tienda/${storeSlug}`} className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={storeName}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
            />
          ) : null}
          <span className="font-heading text-lg leading-none">{storeName}</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-6 pl-4 md:flex">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={`/tienda/${storeSlug}?category=${category.slug}`}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <form
          action={`/tienda/${storeSlug}`}
          className="ml-auto hidden max-w-xs flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              name="q"
              placeholder="Buscar..."
              aria-label="Buscar productos"
              className="h-9 w-full rounded-lg border border-input bg-background pl-8 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </form>

        <CartLink storeSlug={storeSlug} />
      </div>
    </header>
  );
}
