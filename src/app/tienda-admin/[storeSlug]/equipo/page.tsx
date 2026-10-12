import { requireStoreOwner } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { InviteForm } from "./invite-form";

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
        <h1 className="text-lg font-medium">Equipo</h1>
        <ul className="mt-3 flex flex-col gap-1 text-sm">
          {members?.map((member) => (
            <li key={member.user_id}>
              {member.profiles?.full_name ?? "(sin nombre)"} —{" "}
              {member.role === "owner" ? "Propietario" : "Empleado"}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-medium">Invitar a un empleado</h2>
        <div className="mt-3 max-w-md">
          <InviteForm storeSlug={storeSlug} />
        </div>
      </section>

      {invitations && invitations.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium">Invitaciones</h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                {invitation.email} — {invitation.status}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
