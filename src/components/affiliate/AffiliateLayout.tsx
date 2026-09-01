import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { affiliateT as t } from "@/lib/affiliateI18n";
import { affiliateApi } from "@/lib/affiliateApi";
import { useI18n } from "@/lib/i18n";
import { LayoutDashboard, Gift, UserRound, UsersRound } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";

export function AffiliateLayout({ children, portal = false }: { children: ReactNode; portal?: boolean }) {
  const { withLang } = useI18n();
  const navigate = useNavigate();
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
        <Button variant="ghost" size="sm" className="ms-auto shrink-0" onClick={async () => { try { await affiliateApi.logout(); navigate(withLang("/empfehlungsprogramm/anmelden"), { replace: true }); } catch { /* Remain in the guarded portal when logout fails. */ } }}>{t("logout")}</Button>
      </nav></div>}
      {children}
    </main>
    <Footer />
  </div>;
}
