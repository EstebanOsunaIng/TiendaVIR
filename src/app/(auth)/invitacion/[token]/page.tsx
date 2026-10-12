import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { AcceptButton } from "./accept-button";

export default async function InvitacionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: rows } = await supabase.rpc("get_invitation_by_token", { p_token: token });
  const invitation = rows?.[0];

  if (!invitation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitación no válida</CardTitle>
          <CardDescription>Este enlace no existe o ya no está disponible.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (invitation.status !== "pending" || new Date(invitation.expires_at) < new Date()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitación no disponible</CardTitle>
          <CardDescription>
            Esta invitación ya fue usada, fue revocada o expiró. Pide a quien te invitó que te
            envíe una nueva.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { data: userData } = await supabase.auth.getUser();
  const next = `/invitacion/${token}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Te invitaron a {invitation.store_name}</CardTitle>
        <CardDescription>
          Invitación para {invitation.email} como empleado/a.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {userData.user ? (
          <AcceptButton token={token} />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Inicia sesión o crea una cuenta con el correo <strong>{invitation.email}</strong>{" "}
              para unirte.
            </p>
            <Button render={<Link href={`/login?next=${encodeURIComponent(next)}`} />}>
              Iniciar sesión
            </Button>
            <Button variant="outline" render={<Link href={`/registro?next=${encodeURIComponent(next)}`} />}>
              Crear cuenta
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
