import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { affiliateDestination } from "@/lib/affiliate-navigation";
import { Link, NavLink, useLocation } from "react-router-dom";

const logo = "https://vibe.filesafe.space/1775221216043671236/attachments/1051300b-abc5-4b5b-bcc5-ac3429d17253.png";

function AffiliateLogo() {
  return <Link to="/" className="relative z-10 shrink-0" aria-label="TarifButler Startseite"><img src={logo} alt="TarifButler" className="h-16 w-auto object-contain sm:h-20" /></Link>;
}

type LayoutKind = "landing" | "auth" | "portal";

export function AffiliateLayout({ children, kind = "landing", onLogout }: { children: React.ReactNode; kind?: LayoutKind; onLogout?: () => void }) {
  const location = useLocation();
  if (kind === "auth") return <div className="flex min-h-screen flex-col bg-white"><header className="mx-auto flex w-full max-w-6xl px-4 py-3"><AffiliateLogo /></header><main className="flex-1">{children}</main></div>;

  if (kind === "portal") return <div className="flex min-h-screen flex-col bg-white">
    <header className="border-b bg-white" data-testid="affiliate-portal-header"><div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 px-4 py-2 lg:flex-nowrap">
      <AffiliateLogo />
      <nav aria-label="Empfehlungsportal" className="order-3 flex w-full items-center gap-1 overflow-x-auto pb-2 text-sm font-semibold lg:order-none lg:w-auto lg:flex-1 lg:justify-center lg:pb-0">
        {[["portal", "Übersicht"], ["empfehlungen", "Empfehlungen"], ["belohnungen", "Belohnungen"], ["profil", "Einstellungen"]].map(([path, label]) => <NavLink key={path} to={affiliateDestination(`/empfehlungsprogramm/${path}`, location.search)} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 transition-colors ${isActive ? "bg-primary" : "hover:bg-muted"}`}>{label}</NavLink>)}
      </nav>
      <Button variant="outline" className="ml-auto rounded-full" onClick={onLogout}>Abmelden</Button>
    </div></header>
    <main className="flex-1">{children}</main>
  </div>;

  return <div className="flex min-h-screen flex-col bg-white"><header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2"><AffiliateLogo /><Button variant="outline" className="rounded-full px-6 font-bold" asChild><Link to={affiliateDestination("/empfehlungsprogramm/anmelden", location.search)}>Anmelden</Link></Button></div></header><main className="flex-1">{children}</main><Footer /></div>;
}
