import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, Gift, UserRound, UsersRound } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export function AffiliateLayout({ children, portal = false }: { children: ReactNode; portal?: boolean }) {
  const { withLang } = useI18n();
  const links = [
    ["/empfehlungsprogramm/portal", t("dashboard"), LayoutDashboard],
    ["/empfehlungsprogramm/empfehlungen", t("referrals"), UsersRound],
    ["/empfehlungsprogramm/belohnungen", t("rewards"), Gift],
    ["/empfehlungsprogramm/profil", t("profile"), UserRound],
  ] as const;
  return <div className="min-h-screen bg-background text-foreground">
    <Header />
    <main className="min-h-[70vh] pt-24 md:pt-32">
      {portal && <div className="border-b bg-muted/40"><nav aria-label="Portalnavigation" className="container flex gap-1 overflow-x-auto px-4 py-3 md:px-6">
        {links.map(([path, label, Icon]) => <NavLink key={path} to={withLang(path)} className={({ isActive }) => `inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-background"}`}><Icon className="h-4 w-4" />{label}</NavLink>)}
        <Button asChild variant="ghost" size="sm" className="ms-auto shrink-0"><Link to={withLang("/empfehlungsprogramm/anmelden")}>{t("logout")}</Link></Button>
      </nav></div>}
      {children}
    </main>
    <Footer />
  </div>;
}

export function PortalUnavailable() {
  return <div role="status" className="rounded-lg border border-primary/20 bg-secondary p-5"><p className="font-semibold text-secondary-foreground">{t("unavailable")}</p><p className="mt-1 text-sm text-muted-foreground">{t("unavailableCopy")}</p></div>;
}
