import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { affiliateApi, type AffiliateOverview } from "@/lib/affiliateApi";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { Check, Copy, Gift, Link2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function AffiliatePortal() {
  const [data, setData] = useState<AffiliateOverview | null>(null); const [error, setError] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => { let active = true; affiliateApi.overview().then(value => { if (active) setData(value); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, []);
  return <AffiliateLayout portal><Page title={t("dashboard")}>
    {!data && !error && <Loading />}{error && <ErrorState />}{data && <>
      <div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" />{t("programSummary")}</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">{t("programSummaryCopy")}</p><p className="mt-4 text-sm">{t("noGuarantee")}</p></CardContent></Card>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" />{t("referralLink")}</CardTitle></CardHeader><CardContent>{data.referralUrl ? <div className="flex gap-2"><Input dir="ltr" readOnly value={data.referralUrl} /><Button variant="outline" onClick={async () => { await navigator.clipboard.writeText(data.referralUrl); setCopied(true); }}>{copied ? <Check /> : <Copy />}<span className="sr-only">{copied ? t("copied") : t("copy")}</span></Button></div> : <Empty text={t("linkEmpty")} />}</CardContent></Card></div>
      <h2 className="mb-3 mt-8 text-xl font-bold">KPIs</h2><div className="grid gap-4 sm:grid-cols-3"><Metric label={t("recommendations")} value={data.totals.referrals} /><Metric label={t("available")} value={data.totals.availableRewards} /><Metric label={t("paid")} value={data.totals.paidRewards} /></div>
    </>}
  </Page></AffiliateLayout>;
}
export function Page({ title, children }: { title: string; children: React.ReactNode }) { return <section className="container max-w-6xl px-4 py-8 md:px-6 md:py-12"><h1 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>{children}</section>; }
export function Loading() { return <div role="status" className="flex min-h-40 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />{t("dataLoading")}</div>; }
export function ErrorState() { return <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{t("dataError")}</div>; }
export function Empty({ text }: { text: string }) { return <div className="rounded-lg bg-muted p-5 text-center text-sm text-muted-foreground">{text}</div>; }
function Metric({ label, value }: { label: string; value: number }) { return <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold">{value.toLocaleString("de-DE")}</p></CardContent></Card>; }
