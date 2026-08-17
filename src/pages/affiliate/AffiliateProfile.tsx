import { AffiliateLayout, PortalUnavailable } from "@/components/affiliate/AffiliateLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { CreditCard, LockKeyhole, UserRound } from "lucide-react";
import { Page } from "./AffiliatePortal";

export default function AffiliateProfile() {
  const cards = [
    [UserRound, t("accountInfo"), "Name und E-Mail-Adresse werden nach sicherer Anmeldung angezeigt."],
    [LockKeyhole, t("security"), "Passwort und aktive Sitzungen verwalten.", t("changePassword")],
    [CreditCard, t("payout"), `${t("payoutMissing")} ${t("ibanHint")}`],
  ] as const;
  return <AffiliateLayout portal><Page title={t("profile")}><PortalUnavailable /><div className="mt-6 grid gap-5 lg:grid-cols-3">{cards.map(([Icon, title, copy, action]) => <Card key={title}><CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Icon className="h-5 w-5 text-primary" />{title}</CardTitle></CardHeader><CardContent><p className="min-h-16 text-sm text-muted-foreground">{copy}</p>{action && <Button variant="outline" className="mt-4" disabled>{action}</Button>}</CardContent></Card>)}</div></Page></AffiliateLayout>;
}
