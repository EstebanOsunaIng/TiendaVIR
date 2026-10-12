import { requireStoreMember } from "@/lib/auth/require-role";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";
import { Breadcrumbs } from "@/components/admin/breadcrumbs";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreMember(storeSlug);

  return (
    <div className="min-h-screen bg-background lg:pl-60">
      <AppSidebar storeSlug={storeSlug} storeName={context.storeName} role={context.role} />
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <MobileNav storeSlug={storeSlug} storeName={context.storeName} role={context.role} />
        <Breadcrumbs />
      </header>
      <main className="p-4 sm:p-6">{children}</main>
    </div>
  );
}
