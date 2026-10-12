"use client";

import { useState } from "react";
import Link from "next/link";
import { MenuIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Category = { slug: string; name: string };

export function PublicMobileNav({
  storeSlug,
  categories,
}: {
  storeSlug: string;
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Abrir menú" className="md:hidden" />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>Explorar</SheetTitle>
        </SheetHeader>
        <form action={`/tienda/${storeSlug}`} className="px-4">
          <div className="relative">
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
        <nav className="flex flex-col gap-1 px-3">
          <Link
            href={`/tienda/${storeSlug}`}
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted"
          >
            Todo el catálogo
          </Link>
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/tienda/${storeSlug}?category=${category.slug}`}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground/80 hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
