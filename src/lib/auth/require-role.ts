import { notFound, redirect } from "next/navigation";
import { getStoreContext, type StoreContext } from "@/lib/auth/get-store-context";

/**
 * Exige que el usuario actual sea miembro de la tienda (cualquier rol).
 * Redirige a /login si no hay sesión, 404 si la tienda no existe o no es
 * miembro (no se distingue para no filtrar qué tiendas existen).
 */
export async function requireStoreMember(storeSlug: string): Promise<StoreContext> {
  const context = await getStoreContext(storeSlug);
  if (!context) {
    redirect(`/login?next=/tienda-admin/${storeSlug}`);
  }
  return context;
}

/** Exige además que el rol sea 'owner'. */
export async function requireStoreOwner(storeSlug: string): Promise<StoreContext> {
  const context = await requireStoreMember(storeSlug);
  if (context.role !== "owner") {
    notFound();
  }
  return context;
}
