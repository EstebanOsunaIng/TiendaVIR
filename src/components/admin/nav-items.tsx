import {
  BarChart3Icon,
  BoxesIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  SettingsIcon,
  ShirtIcon,
  TagsIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import type { StoreRole } from "@/lib/constants";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/** Misma lógica de filtrado por rol que ya existía: el empleado no ve Reportes/Equipo/Configuración. */
export function getAdminNavItems(storeSlug: string, role: StoreRole): NavItem[] {
  const base = `/tienda-admin/${storeSlug}`;
  return [
    { href: base, label: "Panel", icon: LayoutDashboardIcon },
    { href: `${base}/productos`, label: "Productos", icon: ShirtIcon },
    { href: `${base}/categorias`, label: "Categorías", icon: TagsIcon },
    { href: `${base}/inventario`, label: "Inventario", icon: BoxesIcon },
    { href: `${base}/ventas`, label: "Ventas", icon: WalletIcon },
    { href: `${base}/pedidos`, label: "Pedidos", icon: ClipboardListIcon },
    ...(role === "owner"
      ? [
          { href: `${base}/reportes`, label: "Reportes", icon: BarChart3Icon },
          { href: `${base}/equipo`, label: "Equipo", icon: UsersIcon },
          { href: `${base}/configuracion`, label: "Configuración", icon: SettingsIcon },
        ]
      : []),
  ];
}
