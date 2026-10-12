import Link from "next/link";
import { requireStoreMember } from "@/lib/auth/require-role";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions/auth/sign-out";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);

  const navLinks = [
    { href: `/tienda-admin/${storeSlug}`, label: "Panel" },
    { href: `/tienda-admin/${storeSlug}/productos`, label: "Productos" },
    { href: `/tienda-admin/${storeSlug}/categorias`, label: "Categorías" },
    { href: `/tienda-admin/${storeSlug}/inventario`, label: "Inventario" },
    { href: `/tienda-admin/${storeSlug}/ventas`, label: "Ventas" },
    { href: `/tienda-admin/${storeSlug}/pedidos`, label: "Pedidos" },
    ...(context.role === "owner"
      ? [
          { href: `/tienda-admin/${storeSlug}/reportes`, label: "Reportes" },
          { href: `/tienda-admin/${storeSlug}/equipo`, label: "Equipo" },
          { href: `/tienda-admin/${storeSlug}/configuracion`, label: "Configuración" },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <p className="font-medium">{context.storeName}</p>
          <p className="text-xs text-muted-foreground">
            {context.role === "owner" ? "Propietario" : "Empleado"}
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Salir
            </Button>
          </form>
        </nav>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
