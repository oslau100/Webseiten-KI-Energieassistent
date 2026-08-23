import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { affiliateApi, type AffiliatePayout, type AffiliatePayoutMethod, type AffiliateProfile } from "@/lib/affiliateApi";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { CreditCard, LockKeyhole, UserRound, WalletCards } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Empty, ErrorState, Loading, Page } from "./AffiliatePortal";

export default function AffiliateProfilePage() {
  const [data, setData] = useState<{ profile: AffiliateProfile; payouts: AffiliatePayout[]; method: AffiliatePayoutMethod } | null>(null); const [error, setError] = useState(false);
  useEffect(() => { let active = true; Promise.all([affiliateApi.profile(), affiliateApi.payouts(), affiliateApi.payoutMethod()]).then(([profile, payouts, method]) => { if (active) setData({ profile, payouts, method }); }).catch(() => { if (active) setError(true); }); return () => { active = false; }; }, []);
  return <AffiliateLayout portal><Page title={t("profile")}>{!data && !error && <Loading />}{error && <ErrorState />}{data && <div className="grid gap-5 lg:grid-cols-2">
    <Info icon={UserRound} title={t("accountInfo")}><p className="font-medium">{[data.profile.firstName, data.profile.lastName].filter(Boolean).join(" ") || "—"}</p><p className="mt-1 text-sm text-muted-foreground">{data.profile.status}</p></Info>
    <Info icon={CreditCard} title={t("payout")}>{data.method.maskedIban ? <><p className="font-medium" dir="ltr">{data.method.maskedIban}</p><p className="mt-1 text-sm text-muted-foreground">{data.method.status}</p></> : <Empty text={t("payoutMissing")} />}</Info>
    <Info icon={WalletCards} title={t("payouts")}>{data.payouts.length ? <ul className="space-y-2 text-sm">{data.payouts.map(payout => <li key={payout.id} className="flex justify-between gap-3"><span>{payout.status}</span><strong>{new Intl.NumberFormat("de-DE", { style: "currency", currency: payout.currency }).format(payout.amount)}</strong></li>)}</ul> : <Empty text={t("payoutsEmpty")} />}</Info>
    <Info icon={LockKeyhole} title={t("security")}><PasswordChange /></Info>
  </div>}</Page></AffiliateLayout>;
}
function Info({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) { return <Card><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>; }
function PasswordChange() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const next = String(values.get("newPassword"));
    if (next !== values.get("confirmPassword")) { setStatus("error"); return; }
    setStatus("loading");
    try { await affiliateApi.changePassword(String(values.get("currentPassword")), next); form.reset(); setStatus("success"); } catch { setStatus("error"); }
  }
  return <form className="space-y-3" onSubmit={submit}><PasswordField name="currentPassword" label={t("currentPassword")} /><PasswordField name="newPassword" label={t("newPassword")} /><PasswordField name="confirmPassword" label={t("confirmPassword")} />
    {status === "success" && <p role="status" className="text-sm text-primary">{t("passwordChangeSuccess")}</p>}{status === "error" && <p role="alert" className="text-sm text-destructive">{t("neutralError")}</p>}
    <Button type="submit" disabled={status === "loading"}>{t("changePassword")}</Button></form>;
}
function PasswordField({ name, label }: { name: string; label: string }) { return <div className="space-y-1.5"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} type="password" autoComplete={name === "currentPassword" ? "current-password" : "new-password"} required /></div>; }
