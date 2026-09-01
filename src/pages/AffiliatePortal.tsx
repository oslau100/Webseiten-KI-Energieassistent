import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalShell, useAffiliateCopy } from "@/components/affiliate/AffiliateShell";
import { affiliateApi, type AffiliateCollectionItem, type AffiliateOverview, type AffiliatePayoutMethod, type AffiliateProfile } from "@/lib/affiliateApi";
import { establishAffiliatePortalSession } from "@/lib/affiliateSession";
import { useI18n } from "@/lib/i18n";

type PortalState = "loading" | "ready" | "error" | "unverified";

function usePortalData<T>(load: () => Promise<T>) {
  const navigate = useNavigate();
  const { withLang } = useI18n();
  const [state, setState] = useState<PortalState>("loading");
  const [data, setData] = useState<T>();

  useEffect(() => {
    let active = true;
    establishAffiliatePortalSession().then(async result => {
      if (!active) return;
      if (result.state === "unauthenticated") {
        navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true });
        return;
      }
      if (result.state === "unverified") { setState("unverified"); return; }
      const response = await load();
      if (active) { setData(response); setState("ready"); }
    }).catch(() => active && setState("error"));
    return () => { active = false; };
  }, [load, navigate, withLang]);

  const logout = useCallback(async () => {
    try { await affiliateApi.logout(); } finally { navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true }); }
  }, [navigate, withLang]);
  return { state, data, logout };
}

const State = ({ state }: { state: Exclude<PortalState, "ready"> }) => {
  const c = useAffiliateCopy();
  return <div role={state === "loading" ? "status" : "alert"} className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
    {state === "loading" ? c("portalLoading") : state === "unverified" ? c("portalUnverified") : c("portalError")}
  </div>;
};

function DataCards({ rows, empty }: { rows: AffiliateCollectionItem[]; empty: string }) {
  if (!rows.length) return <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">{empty}</div>;
  return <div className="grid gap-4 md:grid-cols-2">{rows.map((row, index) => <Card key={index}><CardContent className="pt-5 space-y-2">
    {Object.entries(row).map(([key, value]) => <div className="flex justify-between gap-4 text-sm" key={key}><span className="text-muted-foreground">{key}</span><span className="text-end break-all">{value == null ? "—" : String(value)}</span></div>)}
  </CardContent></Card>)}</div>;
}

const overviewLoader = () => affiliateApi.overview();
const referralsLoader = () => affiliateApi.referrals();
const rewardsLoader = () => affiliateApi.rewards();
const profileLoader = () => Promise.all([affiliateApi.profile(), affiliateApi.payouts(), affiliateApi.payoutMethod()]);

function ProfileDetails({ profile }: { profile: AffiliateProfile }) {
  const fields = [["firstName", profile.firstName], ["lastName", profile.lastName], ["languageCode", profile.languageCode], ["status", profile.status], ["memberSince", profile.memberSince]];
  return <Card><CardContent className="pt-5 space-y-2">{fields.map(([key, value]) => <div className="flex justify-between gap-4 text-sm" key={key}><span className="text-muted-foreground">{key}</span><span>{value}</span></div>)}</CardContent></Card>;
}

function PayoutMethod({ method }: { method: AffiliatePayoutMethod | null }) {
  const c = useAffiliateCopy();
  if (!method) return <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">{c("payoutBody")}</div>;
  return <DataCards rows={[{ method: method.method, status: method.status, maskedIban: method.maskedIban, updatedAt: method.updatedAt }]} empty={c("payoutBody")} />;
}

export function Dashboard() {
  const c = useAffiliateCopy();
  const { state, data, logout } = usePortalData<AffiliateOverview>(overviewLoader);
  return <PortalShell title={c("hello")} onLogout={logout}>{state === "ready" && data ? <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">
      <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{c("referrals")}</p><p className="text-2xl font-bold">{data.totals.referrals}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{c("payable")}</p><p className="text-2xl font-bold">{data.totals.availableRewards}</p></CardContent></Card>
      <Card><CardContent className="pt-5"><p className="text-sm text-muted-foreground">{c("paidMoney")}</p><p className="text-2xl font-bold">{data.totals.paidRewards}</p></CardContent></Card>
    </div>
    {data.referralUrl && <Card><CardHeader><CardTitle>{c("referralLink")}</CardTitle></CardHeader><CardContent><a className="text-primary break-all" href={data.referralUrl}>{data.referralUrl}</a></CardContent></Card>}
  </div> : <State state={state} />}</PortalShell>;
}

function CollectionPage({ title, load, empty }: { title: "referrals" | "rewards"; load: () => Promise<AffiliateCollectionItem[]>; empty: string }) {
  const c = useAffiliateCopy();
  const { state, data, logout } = usePortalData(load);
  return <PortalShell title={c(title)} onLogout={logout}>{state === "ready" && data ? <DataCards rows={data} empty={empty} /> : <State state={state} />}</PortalShell>;
}
export function Referrals() { const c = useAffiliateCopy(); return <CollectionPage title="referrals" load={referralsLoader} empty={c("noReferrals")} />; }
export function Rewards() { const c = useAffiliateCopy(); return <CollectionPage title="rewards" load={rewardsLoader} empty={c("noRewards")} />; }

export function Profile() {
  const c = useAffiliateCopy();
  const { state, data, logout } = usePortalData(profileLoader);
  const [passwordState, setPasswordState] = useState<"idle" | "busy" | "success" | "error">("idle");
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); setPasswordState("busy");
    try { await affiliateApi.changePassword(String(form.get("currentPassword")), String(form.get("newPassword"))); formElement.reset(); setPasswordState("success"); }
    catch { setPasswordState("error"); }
  };
  return <PortalShell title={c("profile")} onLogout={logout}>{state === "ready" && data ? <div className="space-y-6">
    <ProfileDetails profile={data[0]} />
    <PayoutMethod method={data[2]} />
    <DataCards rows={data[1]} empty={c("portalEmpty")} />
    <Card><CardHeader><CardTitle>{c("changePassword")}</CardTitle></CardHeader><CardContent><form onSubmit={changePassword} className="space-y-4 max-w-md">
      <div className="space-y-2"><Label htmlFor="currentPassword">{c("currentPassword")}</Label><Input required type="password" id="currentPassword" name="currentPassword" /></div>
      <div className="space-y-2"><Label htmlFor="newPassword">{c("newPassword")}</Label><Input required type="password" id="newPassword" name="newPassword" /></div>
      {passwordState === "success" && <p role="status" className="text-sm text-muted-foreground">{c("passwordChanged")}</p>}
      {passwordState === "error" && <p role="alert" className="text-sm text-muted-foreground">{c("neutralError")}</p>}
      <Button disabled={passwordState === "busy"}>{passwordState === "busy" ? "…" : c("savePassword")}</Button>
    </form></CardContent></Card>
  </div> : <State state={state} />}</PortalShell>;
}
