import { workspaceContext, getMembers, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead, Monogram, Pill } from "@/components/app/ui";
import { MemberProfileForm, type ProfileView } from "@/components/workspace/growth";
import { InviteForm, RoleSelect, RemoveMemberButton, RevokeInviteButton, CopyInviteLink } from "@/components/workspace/forms";

export default async function Team({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current, user } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const role = current!.role;
  const [team, { data: invites }, { data: profiles }] = await Promise.all([
    getMembers(supabase, wsId),
    canManage(role) ? supabase.from("invitations").select("id, email, role, token, expires_at, accepted_at").eq("workspace_id", wsId).is("accepted_at", null).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
    supabase.from("member_profiles").select("user_id, languages, areas, max_open_leads, available, top_performer, alert_phone, availability").eq("workspace_id", wsId),
  ]);
  const prof = new Map((profiles ?? []).map((p) => [p.user_id as string, p as unknown as ProfileView]));
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
      <Card className="mb-5">
        <CardHead title="Lead routing" sub="New leads go to whoever speaks their language, knows the area and has room. Hot leads go to top performers first." />
        <div className="grid gap-3">
          {team.filter((m) => prof.has(m.user_id) && (canManage(role) || m.user_id === user.id)).map((m) => {
            const p = prof.get(m.user_id)!;
            return (
              <details key={m.user_id} className="group rounded-[12px] border border-hairline-soft px-4 py-3" open={team.length === 1}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
                  <Monogram name={m.full_name || "?"} size={30} />
                  <span className="min-w-0 flex-1 font-medium">{m.full_name || t("Teammate")}</span>
                  <span className="t-caption text-ink-2" dir="ltr">{p.languages.join(" · ")}</span>
                  {p.top_performer && <Pill tone="hot">{t("Top performer")}</Pill>}
                  <Pill tone={p.available ? "ok" : "cold"}>{t(p.available ? "Taking leads" : "Away")}</Pill>
                </summary>
                <div className="mt-4"><MemberProfileForm workspaceId={wsId} userId={m.user_id} p={p} canEdit={canManage(role) || m.user_id === user.id} isManager={canManage(role)} /></div>
              </details>
            );
          })}
        </div>
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
