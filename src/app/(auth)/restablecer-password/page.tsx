import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdatePasswordForm } from "./update-password-form";

export default function RestablecerPasswordPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Elige una nueva contraseña</CardTitle>
        <CardDescription>Debes llegar aquí desde el enlace que te enviamos por correo.</CardDescription>
      </CardHeader>
      <CardContent>
        <UpdatePasswordForm />
      </CardContent>
    </Card>
  );
}
