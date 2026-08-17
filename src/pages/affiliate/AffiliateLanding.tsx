import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, Gift, Link2, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";

export default function AffiliateLanding() {
  const { withLang } = useI18n();
  const steps = [[Link2, t("personalLink"), t("landingStep1")], [ListChecks, t("transparent"), t("landingStep2")], [Gift, t("reward"), t("landingStep3")]] as const;
  return <AffiliateLayout><section className="bg-gradient-to-b from-secondary/80 to-background py-16 md:py-24"><div className="container max-w-5xl px-4 text-center">
    <p className="mb-4 font-semibold text-primary">{t("program")}</p><h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{t("landingTitle")}</h1><p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("landingCopy")}</p>
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button asChild size="lg" className="font-semibold"><Link to={withLang("/empfehlungsprogramm/registrieren")}>{t("register")}<ArrowRight className="ms-2 h-4 w-4" /></Link></Button><Button asChild size="lg" variant="outline" className="font-semibold"><Link to={withLang("/empfehlungsprogramm/anmelden")}>{t("login")}</Link></Button></div>
  </div></section><section className="container max-w-5xl px-4 py-14 md:py-20"><div className="grid gap-5 md:grid-cols-3">{steps.map(([Icon, title, copy], index) => <Card key={title}><CardContent className="pt-6"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon /></div><p className="text-sm font-semibold text-primary">0{index + 1}</p><h2 className="mt-1 text-xl font-bold">{title}</h2><p className="mt-2 text-muted-foreground">{copy}</p></CardContent></Card>)}</div><p className="mx-auto mt-8 max-w-3xl rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">{t("noGuarantee")}</p></section></AffiliateLayout>;
}
