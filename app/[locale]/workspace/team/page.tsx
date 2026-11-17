import { workspaceContext, getMembers, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead, Monogram, Pill } from "@/components/app/ui";
import { InviteForm, RoleSelect, RemoveMemberButton, RevokeInviteButton, CopyInviteLink } from "@/components/workspace/forms";

export default async function Team({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const role = current!.role;
  const [team, { data: invites }] = await Promise.all([
    getMembers(supabase, wsId),
    canManage(role) ? supabase.from("invitations").select("id, email, role, token, expires_at, accepted_at").eq("workspace_id", wsId).is("accepted_at", null).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
  ]);
  const roleLabel = (r: string) => t(r[0].toUpperCase() + r.slice(1));
  return (
    <>
      <PageHead title={t("Team")} sub={t("Owners manage the workspace. Managers see every lead. Agents see their own leads and the unassigned pool.")} />
      {canManage(role) && (
        <Card className="mb-5">
          <CardHead title="Invite someone" sub="They’ll join with the role you choose once they sign in with this email." />
          <InviteForm workspaceId={wsId} isOwner={role === "owner"} />
        </Card>
      )}
      <Card className="mb-5">
        <CardHead title="Members" />
        <ul className="divide-y divide-hairline-soft">
          {team.map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center gap-3 py-3">
              <Monogram name={m.full_name || "?"} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{m.full_name || t("Teammate")}{m.user_id === user.id && <span className="text-ink-3"> ({t("you")})</span>}</p>
                <p className="t-caption text-ink-2">{t("Joined")} {new Date(m.created_at).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium" })}</p>
              </div>
              {role === "owner" ? <RoleSelect workspaceId={wsId} userId={m.user_id} role={m.role} /> : <Pill tone={m.role === "owner" ? "creek" : m.role === "manager" ? "ok" : "cold"}>{roleLabel(m.role)}</Pill>}
              {(role === "owner" || m.user_id === user.id) && <RemoveMemberButton workspaceId={wsId} userId={m.user_id} self={m.user_id === user.id} />}
            </li>
          ))}
        </ul>
      </Card>
      {canManage(role) && (
        <Card>
          <CardHead title="Pending invitations" />
          {invites?.length ? (
            <ul className="divide-y divide-hairline-soft">
              {invites.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium" dir="ltr">{i.email}</p>
                    <p className="t-caption text-ink-2">{roleLabel(i.role)} · {new Date(i.expires_at) < new Date() ? t("Expired") : `${t("Expires")} ${new Date(i.expires_at).toLocaleDateString(locale === "ar" ? "ar-AE" : "en-GB", { dateStyle: "medium" })}`}</p>
                  </div>
                  <CopyInviteLink token={i.token} />
                  <RevokeInviteButton id={i.id} />
                </li>
              ))}
            </ul>
          ) : <p className="text-ink-2">{t("No pending invitations.")}</p>}
        </Card>
      )}
    </>
  );
}
