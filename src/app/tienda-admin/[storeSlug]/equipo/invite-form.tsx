"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMember } from "@/actions/auth/invite-member";

export function InviteForm({ storeSlug }: { storeSlug: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setLink(null);
    startTransition(async () => {
      const result = await inviteMember(storeSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setLink(result.invitationLink);
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="invite-email">Correo del empleado</Label>
          <Input id="invite-email" name="email" type="email" required />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Invitando..." : "Invitar"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {link ? (
        <p className="text-sm text-muted-foreground">
          Invitación creada. Envíasela por WhatsApp o correo:{" "}
          <span className="break-all font-mono text-foreground">{link}</span>
        </p>
      ) : null}
    </form>
  );
}
