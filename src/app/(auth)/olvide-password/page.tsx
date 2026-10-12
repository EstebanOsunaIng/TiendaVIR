import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequestResetForm } from "./request-reset-form";

export default function OlvidePasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recupera tu contraseña</CardTitle>
        <CardDescription>Te enviaremos un enlace a tu correo para restablecerla.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <RequestResetForm />
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
