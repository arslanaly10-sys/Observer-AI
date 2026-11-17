"use client";
import { useState } from "react";
import { CheckCircle, WarningCircle, LockKey, Globe, FileText, Bank } from "@phosphor-icons/react";
import { sla, compliance, auditLog, notifs } from "@/lib/data";
import { useT } from "../i18n";
import { useStore } from "../store";
import { Card, CardHead, PageHead, Stat, Stats, Monogram, Btn, Table, Meter, Pill, Dot, cx } from "../ui";

export function Sla() {
  const { t } = useT();
  const { toast } = useStore();
  const [handled, setHandled] = useState<string[]>([]);
  return (
    <>
      <PageHead title="SLA tracking" sub="How long each lead has waited for a human reply. The target is five minutes for hot leads." />
      <Stats>
        <Stat label="On-time replies" value="91%" note="target: 95%" />
        <Stat label="In breach" value="2" note="escalate now" />
        <Stat label="At risk" value="5" note="in the next 15 minutes" />
        <Stat label="Resolved today" value="18" />
      </Stats>
      <Card>
        <CardHead title="Waiting for a reply" aside={<span className="t-caption flex items-center gap-1.5 text-ink-2"><Dot live />{t("Live")}</span>} />
        <ul className="divide-y divide-hairline-soft">
          {sla.map((s) => (
            <li key={s.name} className="flex flex-wrap items-center gap-4 py-3.5">
              <Monogram name={s.name} size={36} />
              <div className="min-w-[180px] flex-1">
                <p className="font-medium">{s.name}</p>
                <p className="t-caption text-ink-2">{t(s.meta)}</p>
              </div>
              <div className="w-40">
                <p className={cx("tnum mb-1 text-[15px] font-semibold", s.status === "breach" ? "text-hot" : s.status === "warn" ? "text-warm" : "text-ok")}>{s.timer}</p>
                <Meter value={s.pct} tone={s.status === "breach" ? "hot" : s.status === "warn" ? "warm" : "ok"} />
              </div>
              {handled.includes(s.name)
                ? <Pill tone="ok">{t("Handled")}</Pill>
                : <Btn variant={s.status === "breach" ? "primary" : "secondary"} onClick={() => { setHandled((h) => [...h, s.name]); toast(`${t(s.action)}: ${s.name}`); }}>{t(s.action)}</Btn>}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

const icons = [LockKey, Globe, FileText, Bank];
export function Compliance() {
  const { t } = useT();
  return (
    <>
      <PageHead title="Compliance" sub="Where your data lives, who touched it, and what still needs doing." />
      <Stats>
        <Stat label="Status" value={t("Compliant")} note="last audit 2 days ago" />
        <Stat label="Data region" value={t("Bahrain")} note="AWS Middle East" />
        <Stat label="Open items" value="1" note="PDPL privacy notice" />
        <Stat label="Encryption" value="AES-256" note="at rest and in transit" />
      </Stats>
      <div className="grid gap-4 md:grid-cols-2">
        {compliance.map((c, i) => {
          const Icon = icons[i];
          return (
            <Card key={c.title}>
              <div className="flex items-start gap-3">
                <span className="flex size-10 items-center justify-center rounded-full bg-creek-soft text-creek"><Icon size={20} /></span>
                <div>
                  <h2 className="font-semibold">{t(c.title)}</h2>
                  <p className="t-caption text-ink-2">{t(c.desc)}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {c.checks.map((k) => (
                  <li key={k.label} className="flex items-center gap-2 text-[15px]">
                    {k.ok ? <CheckCircle size={18} weight="fill" className="text-ok" /> : <WarningCircle size={18} weight="fill" className="text-warm" />}
                    {t(k.label)}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
      <Card className="mt-5">
        <CardHead title="Audit log, last 24 hours" />
        <Table head={["Time", "Event", "User", "IP address", "Status"]} minWidth={640}>
          {auditLog.map((a) => (
            <tr key={a.time + a.event}>
              <td className="tnum text-ink-2">{a.time}</td>
              <td className="font-medium">{t(a.event)}</td>
              <td>{t(a.user)}</td>
              <td className="tnum text-ink-2" dir="ltr">{a.ip}</td>
              <td><Pill tone={a.ok ? "ok" : "warm"}>{t(a.ok ? "OK" : "Review")}</Pill></td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}

export function Notifications() {
  const { t } = useT();
  const [read, setRead] = useState(false);
  return (
    <>
      <PageHead title="Notifications" sub="Only what needs a person. Observer handles the rest quietly." actions={<Btn variant="secondary" onClick={() => setRead(true)}>{t("Mark all as read")}</Btn>} />
      <Card pad={false}>
        <ul className="divide-y divide-hairline-soft">
          {notifs.map((n, i) => {
            const unread = n.unread && !read;
            return (
              <li key={i} className={cx("flex items-start gap-3 px-5 py-4", unread && "bg-creek-soft/40")}>
                <span className="mt-2"><Dot tone={n.tone} /></span>
                <p className={cx("flex-1 text-[15px]", unread ? "font-medium" : "text-ink-2")}>{t(n.text)}</p>
                <span className="t-caption whitespace-nowrap text-ink-3">{t(n.time)}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
