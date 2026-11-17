import { workspaceContext, canManage } from "@/lib/workspace";
import { makeT } from "@/lib/tr";
import { Card, CardHead, PageHead, Dot } from "@/components/app/ui";
import { AiSettingsForm, TestLeadForm, CopyField, RotateKeyButton, type SettingsView } from "@/components/workspace/growth";
import { providerStatus, APP_URL } from "@/lib/growth/config";

export default async function AiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = makeT(locale);
  const { supabase, current } = await workspaceContext(locale);
  const wsId = current!.workspace.id;
  const manager = canManage(current!.role);
  const [{ data }, { data: keys }] = await Promise.all([
    supabase.from("workspace_settings").select("assistant_name, timezone, office_hours, holidays, ai_enabled, sandbox_mode, quiet_start, quiet_end, followup_days, escalate_score, first_contact_delay_s, whatsapp_phone_number_id, whatsapp_template, email_from, voice_from, meta_page_id").eq("workspace_id", wsId).maybeSingle(),
    manager ? supabase.rpc("workspace_keys", { ws: wsId }) : Promise.resolve({ data: null }),
  ]);
  const k = (keys as { ingest_token: string; form_key: string }[] | null)?.[0];
  if (!data) return <PageHead title={t("AI & channels")} sub={t("Settings are still being created. Refresh in a moment.")} />;
  const s = { ...data, quiet_start: String(data.quiet_start).slice(0, 5), quiet_end: String(data.quiet_end).slice(0, 5) } as SettingsView;
  const p = providerStatus();
  const base = APP_URL();
  const intake = `${base}/api/intake/${k?.ingest_token ?? ""}`;
  const formUrl = `${base}/api/intake/${k?.form_key ?? ""}`;
  const status: [string, boolean, string][] = [
    ["Claude (scoring and replies)", p.anthropic, "ANTHROPIC_API_KEY"],
    ["Managed Agent sessions", p.managedAgent, "OBSERVER_AGENT_ID, OBSERVER_ENVIRONMENT_ID"],
    ["Background worker", p.supabaseAdmin && p.worker, "SUPABASE_SECRET_KEY, WORKER_SECRET"],
    ["WhatsApp Cloud API", p.whatsapp, "WHATSAPP_ACCESS_TOKEN, META_APP_SECRET"],
    ["Meta Lead Ads", p.metaLeads, "META_PAGE_ACCESS_TOKEN, META_VERIFY_TOKEN"],
    ["Email (Resend)", p.email, "RESEND_API_KEY"],
    ["Email replies", p.emailInbound, "RESEND_WEBHOOK_SECRET, RESEND_INBOUND_DOMAIN"],
    ["Voice calls (Twilio)", p.voice, "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN"],
    ["Natural voice (ElevenLabs)", p.tts, "ELEVENLABS_API_KEY"],
  ];

  return (
    <>
      <PageHead title={t("AI & channels")} sub={t("How your assistant behaves, when it speaks, and where leads come from.")} />
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <Card><CardHead title="Assistant settings" sub={manager ? undefined : "Only owners and managers can change these."} /><AiSettingsForm workspaceId={wsId} s={s} disabled={!manager} /></Card>
        <div className="grid content-start gap-5">
          <Card>
            <CardHead title="Connections" sub="Keys live in your server environment, never in the browser." />
            <ul className="grid gap-2.5">
              {status.map(([label, on, env]) => (
                <li key={label} className="flex items-start gap-2.5 text-[14px]">
                  <span className="mt-1.5"><Dot tone={on ? "ok" : "warm"} /></span>
                  <span className="min-w-0 flex-1"><span className="block">{t(label)}</span>{!on && <code className="t-fine text-ink-3" dir="ltr">{env}</code>}</span>
                  <span className="t-caption text-ink-2">{t(on ? "Connected" : "Not set")}</span>
                </li>
              ))}
            </ul>
          </Card>
          {manager && (
            <Card>
              <CardHead title="Lead sources" sub="Point each source at its address. The token identifies this workspace; keep it private." />
              <div className="grid gap-4">
                <CopyField label="Website and landing-page forms (safe to put in your page)" value={formUrl} />
                <p className="t-caption -mt-2 text-ink-2">{t("Add a Cloudflare Turnstile widget to the form and set TURNSTILE_SECRET_KEY. Without it, each address is limited to 5 submissions per 10 minutes.")}</p>
                <p className="t-caption text-ink-2">{t("The addresses below contain your private key. Use them only in server-to-server tools, never in a web page.")}</p>
                <CopyField label="TikTok lead webhook" value={`${intake}?source=tiktok`} />
                <CopyField label="Snapchat lead webhook" value={`${intake}?source=snapchat`} />
                <CopyField label="Bayut / Property Finder / Dubizzle (via email parser or Zapier)" value={`${intake}?source=propertyfinder`} />
                <CopyField label="Google Ads lead form (webhook URL; key = the token)" value={`${base}/api/webhooks/google/${k?.ingest_token ?? ""}`} />
                <CopyField label="Meta (Lead Ads + WhatsApp) callback URL" value={`${base}/api/webhooks/meta`} />
                <CopyField label="Resend webhook" value={`${base}/api/webhooks/resend`} />
                <CopyField label="Twilio voice webhook" value={`${base}/api/webhooks/twilio/voice`} />
                <div className="flex flex-wrap gap-2 pt-1"><RotateKeyButton workspaceId={wsId} which="form" /><RotateKeyButton workspaceId={wsId} which="ingest" /></div>
              </div>
            </Card>
          )}
          {manager && (
            <Card>
              <CardHead title="Try it" sub="Sends a pretend enquiry through scoring, routing and first contact. Sandbox only." />
              <TestLeadForm workspaceId={wsId} />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
