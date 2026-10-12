import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-medium">Página no encontrada</h1>
      <p className="text-muted-foreground">Lo que buscas no existe o ya no está disponible.</p>
      <Button render={<Link href="/" />}>Volver al inicio</Button>
    </div>
  );
}
