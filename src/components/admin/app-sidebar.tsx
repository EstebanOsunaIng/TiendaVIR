"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth/sign-out";
import { getAdminNavItems } from "./nav-items";
import type { StoreRole } from "@/lib/constants";

export function AppSidebar({
  storeSlug,
  storeName,
  role,
}: {
  storeSlug: string;
  storeName: string;
  role: StoreRole;
}) {
  const pathname = usePathname();
  const navItems = getAdminNavItems(storeSlug, role);

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex flex-col gap-0.5 px-5 py-6">
        <p className="truncate font-heading text-lg leading-tight">{storeName}</p>
        <p className="text-xs text-sidebar-foreground/60">
          {role === "owner" ? "Propietario" : "Empleado"}
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2.5 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOutIcon className="size-4" />
            Salir
          </Button>
        </form>
      </div>
    </aside>
  );
}
