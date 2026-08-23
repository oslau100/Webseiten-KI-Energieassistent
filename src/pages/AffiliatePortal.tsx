import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortalShell, useAffiliateCopy } from "@/components/affiliate/AffiliateShell";
import { affiliateApi, type AffiliateDto } from "@/lib/affiliateApi";
import { establishAffiliatePortalSession } from "@/lib/affiliateSession";
import { useI18n } from "@/lib/i18n";

type PortalState = "loading" | "ready" | "error" | "unverified";

function usePortalData(load: () => Promise<AffiliateDto | AffiliateDto[]>) {
  const navigate = useNavigate();
  const { withLang } = useI18n();
  const [state, setState] = useState<PortalState>("loading");
  const [data, setData] = useState<AffiliateDto | AffiliateDto[]>();

  useEffect(() => {
    let active = true;
    establishAffiliatePortalSession()
      .then(async result => {
        if (!active) return;
        if (result.state === "unauthenticated") {
          navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true });
          return;
        }
        if (result.state === "unverified") {
          setState("unverified");
          return;
        }
        const response = await load();
        if (active) {
          setData(response);
          setState("ready");
        }
      })
      .catch(() => active && setState("error"));
    return () => { active = false; };
  }, [load, navigate, withLang]);

  const logout = useCallback(async () => {
    try { await affiliateApi.logout(); } finally {
      navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true });
    }
  }, [navigate, withLang]);

  return { state, data, logout };
}

const State = ({ state }: { state: Exclude<PortalState, "ready"> }) => {
  const c = useAffiliateCopy();
  return <div role={state === "loading" ? "status" : "alert"} className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
    {state === "loading" ? c("portalLoading") : state === "unverified" ? c("portalUnverified") : c("portalError")}
  </div>;
};

function values(data: AffiliateDto | AffiliateDto[] | undefined): AffiliateDto[] {
  if (Array.isArray(data)) return data;
  if (!data) return [];
  for (const key of ["items", "referrals", "rewards", "payouts"]) {
    if (Array.isArray(data[key])) return data[key] as AffiliateDto[];
  }
  return Object.keys(data).length ? [data] : [];
}

function DataCards({ data, empty }: { data: AffiliateDto | AffiliateDto[] | undefined; empty: string }) {
  const rows = values(data);
  if (!rows.length) return <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">{empty}</div>;
  return <div className="grid gap-4 md:grid-cols-2">{rows.map((row, index) => <Card key={index}><CardContent className="pt-5 space-y-2">
    {Object.entries(row).filter(([, value]) => value == null || ["string", "number", "boolean"].includes(typeof value)).map(([key, value]) =>
      <div className="flex justify-between gap-4 text-sm" key={key}><span className="text-muted-foreground">{key}</span><span className="text-end break-all">{value == null ? "—" : String(value)}</span></div>)}
  </CardContent></Card>)}</div>;
}

const overviewLoader = () => affiliateApi.overview();
const referralsLoader = () => affiliateApi.referrals();
const rewardsLoader = () => affiliateApi.rewards();
const profileLoader = async () => {
  const [profile, payouts, payoutMethod] = await Promise.all([affiliateApi.profile(), affiliateApi.payouts(), affiliateApi.payoutMethod()]);
  return { profile, payouts, payoutMethod };
};

function PortalPage({ title, load, empty }: { title: "hello" | "referrals" | "rewards" | "profile"; load: () => Promise<AffiliateDto>; empty: string }) {
  const c = useAffiliateCopy();
  const { state, data, logout } = usePortalData(load);
  return <PortalShell title={c(title)} onLogout={logout}>
    {state === "ready" ? <DataCards data={data} empty={empty} /> : <State state={state} />}
  </PortalShell>;
}

export function Dashboard() { const c = useAffiliateCopy(); return <PortalPage title="hello" load={overviewLoader} empty={c("portalEmpty")} />; }
export function Referrals() { const c = useAffiliateCopy(); return <PortalPage title="referrals" load={referralsLoader} empty={c("noReferrals")} />; }
export function Rewards() { const c = useAffiliateCopy(); return <PortalPage title="rewards" load={rewardsLoader} empty={c("noRewards")} />; }
export function Profile() {
  const c = useAffiliateCopy();
  const { state, data, logout } = usePortalData(profileLoader);
  const [passwordState, setPasswordState] = useState<"idle" | "busy" | "success" | "error">("idle");
  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPasswordState("busy");
    try {
      await affiliateApi.changePassword(String(form.get("currentPassword")), String(form.get("newPassword")));
      event.currentTarget.reset();
      setPasswordState("success");
    } catch { setPasswordState("error"); }
  };
  return <PortalShell title={c("profile")} onLogout={logout}>
    {state === "ready" ? <div className="space-y-6"><DataCards data={data} empty={c("portalEmpty")} />
      <Card><CardHeader><CardTitle>{c("changePassword")}</CardTitle></CardHeader><CardContent>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div className="space-y-2"><Label htmlFor="currentPassword">{c("currentPassword")}</Label><Input required type="password" id="currentPassword" name="currentPassword" /></div>
          <div className="space-y-2"><Label htmlFor="newPassword">{c("newPassword")}</Label><Input required type="password" id="newPassword" name="newPassword" /></div>
          {passwordState === "success" && <p role="status" className="text-sm text-muted-foreground">{c("passwordChanged")}</p>}
          {passwordState === "error" && <p role="alert" className="text-sm text-muted-foreground">{c("neutralError")}</p>}
          <Button disabled={passwordState === "busy"}>{passwordState === "busy" ? "…" : c("savePassword")}</Button>
        </form>
      </CardContent></Card>
    </div> : <State state={state} />}
  </PortalShell>;
}
