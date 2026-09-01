import { AffiliateApiError, affiliateApi } from "@/lib/affiliateApi";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export function AffiliateGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate(); const { withLang } = useI18n();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  useEffect(() => {
    let active = true;
    affiliateApi.session().then(async session => {
      if (!active) return;
      if (!session.authenticated) { navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true }); return; }
      if (!session.user?.emailVerified) { setStatus("error"); return; }
      await affiliateApi.bootstrapProfile();
      if (active) setStatus("ready");
    }).catch(error => {
      if (!active) return;
      if (error instanceof AffiliateApiError && (error.status === 401 || error.status === 403)) navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true });
      else setStatus("error");
    });
    return () => { active = false; };
  }, [navigate, withLang]);
  if (status === "loading") return <div role="status" className="container flex min-h-64 items-center justify-center gap-3 px-4 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />{t("portalLoading")}</div>;
  if (status === "error") return <div role="alert" className="container my-10 max-w-3xl rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">{t("neutralError")}</div>;
  return children;
}
