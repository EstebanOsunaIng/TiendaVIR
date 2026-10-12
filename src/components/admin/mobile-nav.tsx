"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon, LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOut } from "@/actions/auth/sign-out";
import { getAdminNavItems } from "./nav-items";
import type { StoreRole } from "@/lib/constants";

export function MobileNav({
  storeSlug,
  storeName,
  role,
}: {
  storeSlug: string;
  storeName: string;
  role: StoreRole;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navItems = getAdminNavItems(storeSlug, role);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="icon" aria-label="Abrir menú" className="size-11 lg:hidden" />
        }
      >
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <SheetHeader>
          <SheetTitle>{storeName}</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {role === "owner" ? "Propietario" : "Empleado"}
          </p>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/80 hover:bg-muted",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-border px-3 py-4">
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start gap-2.5">
              <LogOutIcon className="size-4" />
              Salir
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
