import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegistroForm } from "./registro-form";

export default function RegistroPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crea tu tienda en TiendaVit</CardTitle>
        <CardDescription>Regístrate como propietario y arma tu catálogo.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Suspense>
          <RegistroForm />
        </Suspense>
        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline">
            Inicia sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
