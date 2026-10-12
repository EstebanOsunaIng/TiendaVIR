"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
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

  async function handleCopy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
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
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <span className="flex-1 truncate font-mono text-xs text-foreground">{link}</span>
          <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
            <CopyIcon />
            Copiar
          </Button>
        </div>
      ) : null}
    </form>
  );
}
