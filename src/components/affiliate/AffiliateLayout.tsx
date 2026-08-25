import { useState } from "react";
import { Menu } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { affiliateDestination } from "@/lib/affiliate-navigation";

const logo = "https://vibe.filesafe.space/1775221216043671236/attachments/b2572ba8-d0c7-41dd-a8da-2b7674556501.png";

const portalLinks = [
  ["portal", "Übersicht"],
  ["empfehlungen", "Empfehlungen"],
  ["belohnungen", "Belohnungen"],
  ["profil", "Einstellungen"],
] as const;

function AffiliateLogo() {
  return (
    <Link
      to="/"
      className="relative block h-20 w-40 shrink-0 md:h-32 md:w-56"
      aria-label="TarifButler Startseite"
    >
      <img
        src={logo}
        alt="TarifButler Logo"
        className="pointer-events-none absolute left-0 top-1/2 h-40 w-40 -translate-y-1/2 object-contain md:h-56 md:w-56"
      />
    </Link>
  );
}

type LayoutKind = "landing" | "auth" | "portal";

export function AffiliateLayout({ children, kind = "landing", onLogout }: { children: React.ReactNode; kind?: LayoutKind; onLogout?: () => void }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (kind === "auth") return <div className="flex min-h-screen flex-col bg-white"><header className="mx-auto flex w-full max-w-6xl px-4 py-3"><AffiliateLogo /></header><main className="flex-1">{children}</main></div>;

  if (kind === "portal") return <div className="flex min-h-screen flex-col bg-white">
    <header className="border-b bg-white" data-testid="affiliate-portal-header"><div className="mx-auto flex max-w-6xl items-center gap-5 px-4 py-2">
      <AffiliateLogo />
      <nav aria-label="Empfehlungsportal" className="hidden items-center gap-1 text-sm font-semibold lg:flex">
        {portalLinks.map(([path, label]) => <NavLink key={path} to={affiliateDestination(`/empfehlungsprogramm/${path}`, location.search)} className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-2 transition-colors ${isActive ? "bg-primary" : "hover:bg-muted"}`}>{label}</NavLink>)}
      </nav>
      <Button variant="outline" className="ml-auto hidden rounded-full lg:inline-flex" onClick={onLogout}>Abmelden</Button>
      <div className="ml-auto lg:hidden">
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full" aria-label="Portal-Menü öffnen" aria-expanded={mobileMenuOpen}>
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 max-w-[calc(100vw-2rem)] rounded-2xl p-2">
            {portalLinks.map(([path, label]) => (
              <DropdownMenuItem key={path} asChild className="cursor-pointer rounded-xl px-3 py-3 text-base font-semibold">
                <Link to={affiliateDestination(`/empfehlungsprogramm/${path}`, location.search)} onClick={() => setMobileMenuOpen(false)}>{label}</Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer rounded-xl px-3 py-3 text-base font-semibold" onSelect={onLogout}>Abmelden</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div></header>
    <main className="flex-1">{children}</main>
  </div>;

  return <div className="flex min-h-screen flex-col bg-white"><header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2"><AffiliateLogo /><Button variant="outline" className="rounded-full px-6 font-bold" asChild><Link to={affiliateDestination("/empfehlungsprogramm/anmelden", location.search)}>Anmelden</Link></Button></div></header><main className="flex-1">{children}</main><Footer /></div>;
}
