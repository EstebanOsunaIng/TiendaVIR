"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acceptInvitation } from "@/actions/auth/accept-invitation";

export function AcceptButton({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitation(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/tienda-admin/${result.storeSlug}`);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button onClick={handleAccept} disabled={isPending}>
        {isPending ? "Uniéndote..." : "Unirme a la tienda"}
      </Button>
    </div>
  );
}
