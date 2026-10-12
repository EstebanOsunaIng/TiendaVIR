import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-3xl font-semibold">TiendaVit</h1>
      <p className="max-w-md text-muted-foreground">
        Gestión de inventario y catálogo público para tiendas de ropa.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/registro" />}>Crear mi tienda</Button>
        <Button variant="outline" render={<Link href="/login" />}>
          Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
