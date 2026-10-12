"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  productos: "Productos",
  nuevo: "Nuevo",
  categorias: "Categorías",
  inventario: "Inventario",
  movimientos: "Movimientos",
  ventas: "Ventas",
  pedidos: "Pedidos",
  reportes: "Reportes",
  equipo: "Equipo",
  configuracion: "Configuración",
};

/** Deriva las migas de pan desde la URL; no requiere que cada página las declare. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const params = useParams<{ storeSlug: string }>();
  const base = `/tienda-admin/${params.storeSlug}`;

  if (pathname === base) return null;

  const rest = pathname.slice(base.length).split("/").filter(Boolean);

  const crumbs = rest.map((segment, index) => {
    const href = `${base}/${rest.slice(0, index + 1).join("/")}`;
    const label = SEGMENT_LABELS[segment] ?? "Detalle";
    return { href, label };
  });

  return (
    <nav aria-label="Ruta de navegación" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Link href={base} className="hover:text-foreground">
        Panel
      </Link>
      {crumbs.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          <ChevronRightIcon className="size-3.5" />
          {index === crumbs.length - 1 ? (
            <span aria-current="page" className="font-medium text-foreground">
              {crumb.label}
            </span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
