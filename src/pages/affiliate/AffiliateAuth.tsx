import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { affiliateApi } from "@/lib/affiliateApi";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { useI18n } from "@/lib/i18n";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type Mode = "login" | "register" | "forgot" | "reset" | "activation";
type Completion = Exclude<Mode, "login" | "activation">;
export default function AffiliateAuth({ mode }: { mode: Mode }) {
  const { withLang } = useI18n(); const navigate = useNavigate(); const [params] = useSearchParams();
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [completion, setCompletion] = useState<Completion | null>(null);
  const title = mode === "login" ? t("login") : mode === "register" ? t("createAccount") : mode === "forgot" ? t("forgotTitle") : mode === "reset" ? t("resetTitle") : t("activationTitle");
  const invalidToken = (mode === "reset" || mode === "activation") && !params.get("token");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const data = new FormData(event.currentTarget);
    if ((mode === "register" || mode === "reset") && data.get("password") !== data.get("confirmPassword")) { setError(t("passwordMismatch")); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await affiliateApi.login(String(data.get("email")), String(data.get("password")));
        navigate(withLang("/empfehlungsprogramm/portal"));
        return;
      }
      if (mode === "register") await affiliateApi.register(String(data.get("name")), String(data.get("email")), String(data.get("password")));
      if (mode === "forgot") await affiliateApi.forgotPassword(String(data.get("email")));
      if (mode === "reset") await affiliateApi.resetPassword(params.get("token") ?? "", String(data.get("password")));
      setCompletion(mode);
    } catch { setError(t("neutralError")); } finally { setLoading(false); }
  }
  if (mode === "activation") return <AffiliateLayout><AuthShell title={title}>{invalidToken ? <State text={t("invalidLink")} /> : <State loading text={t("activationPending")} />}</AuthShell></AffiliateLayout>;
  if (invalidToken) return <AffiliateLayout><AuthShell title={title}><State text={t("invalidLink")} /><Button asChild className="w-full"><Link to={withLang("/empfehlungsprogramm/passwort-vergessen")}>{t("forgotTitle")}</Link></Button></AuthShell></AffiliateLayout>;
  if (completion) return <AffiliateLayout><AuthShell title={completion === "register" ? t("registrationSuccessTitle") : completion === "forgot" ? t("submittedTitle") : t("resetSuccess")}><State text={completion === "register" ? t("registrationSuccessCopy") : completion === "forgot" ? t("submittedCopy") : t("resetSuccess")} /><Button asChild className="w-full"><Link to={withLang("/empfehlungsprogramm/anmelden")}>{t("backLogin")}</Link></Button></AuthShell></AffiliateLayout>;
  return <AffiliateLayout><AuthShell title={title} description={mode === "forgot" ? t("forgotCopy") : undefined}><form className="space-y-4" onSubmit={submit}>
    {mode === "register" && <Field name="name" label={t("name")} autoComplete="name" />}
    {mode !== "reset" && <Field name="email" label={t("email")} type="email" autoComplete="email" />}
    {(mode === "login" || mode === "register" || mode === "reset") && <Field name="password" label={t("password")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} />}
    {(mode === "register" || mode === "reset") && <Field name="confirmPassword" label={t("confirmPassword")} type="password" autoComplete="new-password" />}
    {mode === "register" && <div className="flex items-start gap-3"><Checkbox id="consent" name="consent" required /><Label htmlFor="consent" className="text-sm font-normal leading-5">{t("consent")}</Label></div>}
    {error && <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
    <Button className="w-full font-semibold" disabled={loading}>{loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}{mode === "login" ? t("login") : mode === "forgot" ? t("forgotTitle") : mode === "reset" ? t("resetTitle") : t("createAccount")}</Button>
    <div className="flex flex-wrap justify-between gap-2 text-sm">{mode === "login" && <Link className="text-primary hover:underline" to={withLang("/empfehlungsprogramm/passwort-vergessen")}>{t("forgot")}</Link>}<Link className="text-primary hover:underline" to={withLang(mode === "login" ? "/empfehlungsprogramm/registrieren" : "/empfehlungsprogramm/anmelden")}>{mode === "login" ? t("register") : t("backLogin")}</Link></div>
  </form></AuthShell></AffiliateLayout>;
}
function AuthShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <section className="container max-w-md px-4 py-12 md:py-20"><Card><CardHeader><p className="text-sm font-semibold text-primary">{t("program")}</p><CardTitle className="text-2xl">{title}</CardTitle>{description && <CardDescription>{description}</CardDescription>}</CardHeader><CardContent>{children}</CardContent></Card></section>; }
function Field({ name, label, ...props }: { name: string; label: string } & React.ComponentProps<typeof Input>) { return <div className="space-y-2"><Label htmlFor={name}>{label}</Label><Input id={name} name={name} required {...props} /></div>; }
function State({ text, loading }: { text: string; loading?: boolean }) { return <div role="status" className="mb-5 flex items-start gap-3 rounded-lg bg-muted p-4 text-sm text-muted-foreground">{loading && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" />}{text}</div>; }
