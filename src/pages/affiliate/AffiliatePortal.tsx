import { AffiliateLayout, PortalUnavailable } from "@/components/affiliate/AffiliateLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { Check, Copy, Gift, Link2 } from "lucide-react";
import { useState } from "react";

export default function AffiliatePortal() {
  const [copied, setCopied] = useState(false);
  const kpis = [t("linkClicks"), t("recommendations"), t("contracts"), t("confirmed")];
  const rewards = [t("pending"), t("available"), t("paid")];
  return <AffiliateLayout portal><Page title={t("dashboard")}><PortalUnavailable />
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />{t("programSummary")}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{t("programSummaryCopy")}</p><p className="mt-4 text-sm">{t("noGuarantee")}</p></CardContent></Card>
    <Card><CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" />{t("referralLink")}</CardTitle></CardHeader><CardContent><div className="flex gap-2"><Input dir="ltr" readOnly value="Wird nach der Anmeldung bereitgestellt" /><Button variant="outline" disabled onClick={() => setCopied(true)}>{copied ? <Check /> : <Copy />}<span className="sr-only">{copied ? t("copied") : t("copy")}</span></Button></div><div className="mt-3 flex items-center justify-between"><Badge variant="secondary">?lang=de</Badge><Button variant="ghost" size="sm" disabled>{t("share")}</Button></div></CardContent></Card></div>
    <h2 className="mb-3 mt-8 text-xl font-bold">KPIs</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{kpis.map(label => <Metric key={label} label={label} />)}</div>
    <h2 className="mb-3 mt-8 text-xl font-bold">{t("rewards")}</h2><div className="grid gap-4 sm:grid-cols-3">{rewards.map(label => <Metric key={label} label={label} currency />)}</div>
  </Page></AffiliateLayout>;
}
export function Page({ title, children }: { title: string; children: React.ReactNode }) { return <section className="container max-w-6xl px-4 py-8 md:px-6 md:py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>{children}</section>; }
function Metric({ label, currency }: { label: string; currency?: boolean }) { return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold" aria-label="Nicht verfügbar">—{currency ? " €" : ""}</p></CardContent></Card>; }
