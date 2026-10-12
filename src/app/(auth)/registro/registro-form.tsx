"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/actions/auth/sign-up";

export function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const isJoiningInvitation = Boolean(next?.startsWith("/invitacion/"));

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signUp(formData, next ?? "/login");
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.needsEmailConfirmation) {
        setConfirmationSent(true);
        return;
      }
      router.push(next ?? "/login");
    });
  }

  if (confirmationSent) {
    return (
      <p className="text-sm text-muted-foreground">
        Te enviamos un correo para confirmar tu cuenta. Una vez confirmado, inicia sesión.
      </p>
    );
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Tu nombre</Label>
        <Input id="fullName" name="fullName" required autoComplete="name" />
      </div>
      {isJoiningInvitation ? null : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="storeName">Nombre de tu tienda</Label>
          <Input id="storeName" name="storeName" required />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Correo</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creando cuenta..." : isJoiningInvitation ? "Crear cuenta" : "Crear cuenta y tienda"}
      </Button>
    </form>
  );
}
