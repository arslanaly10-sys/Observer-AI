import { workspaceContext } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead } from "@/components/app/ui";
import { WorkspaceForm, ProfileForm, DeleteWorkspaceForm } from "@/components/workspace/forms";

export default async function Settings({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { current, profile, user } = await workspaceContext(locale);
  const owner = current!.role === "owner";
  return (
    <>
      <PageHead title={t("Settings")} />
      <div className="grid gap-5">
        <Card>
          <CardHead title="Your profile" sub={user.email} />
          <ProfileForm fullName={profile?.full_name ?? ""} locale={profile?.locale ?? locale} />
        </Card>
        <Card>
          <CardHead title="Workspace" sub={owner ? undefined : "Only owners can change workspace details."} />
          <WorkspaceForm workspaceId={current!.workspace.id} name={current!.workspace.name} city={current!.workspace.city} disabled={!owner} />
        </Card>
        {owner && (
          <Card className="border-hot/30">
            <CardHead title="Delete workspace" />
            <DeleteWorkspaceForm workspaceId={current!.workspace.id} name={current!.workspace.name} />
          </Card>
        )}
      </div>
    </>
  );
}
