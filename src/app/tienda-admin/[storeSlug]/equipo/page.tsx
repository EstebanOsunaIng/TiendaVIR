import { requireStoreOwner } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, type Status } from "@/components/shared/status-badge";
import { InviteForm } from "./invite-form";

const INVITATION_STATUS: Record<string, { status: Status; label: string }> = {
  pending: { status: "pending", label: "Pendiente" },
  accepted: { status: "confirmed", label: "Aceptada" },
  revoked: { status: "cancelled", label: "Revocada" },
};

function initials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function EquipoPage({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) {
  const { storeSlug } = await params;
  const context = await requireStoreOwner(storeSlug);
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("store_members")
    .select("user_id, role, profiles(full_name)")
    .eq("store_id", context.storeId);

  const { data: invitations } = await supabase
    .from("store_invitations")
    .select("id, email, status, created_at")
    .eq("store_id", context.storeId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-heading text-xl">Equipo</h1>
        <ul className="mt-4 flex flex-col gap-3">
          {members?.map((member) => (
            <li key={member.user_id} className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials(member.profiles?.full_name ?? null)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{member.profiles?.full_name ?? "(sin nombre)"}</p>
                <p className="text-xs text-muted-foreground">
                  {member.role === "owner" ? "Propietario" : "Empleado"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Invitar a un empleado</h2>
        <div className="mt-3 max-w-md">
          <InviteForm storeSlug={storeSlug} />
        </div>
      </section>

      {invitations && invitations.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground">Invitaciones</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {invitations.map((invitation) => {
              const meta = INVITATION_STATUS[invitation.status] ?? {
                status: "pending" as Status,
                label: invitation.status,
              };
              return (
                <li key={invitation.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{invitation.email}</span>
                  <StatusBadge status={meta.status} label={meta.label} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
