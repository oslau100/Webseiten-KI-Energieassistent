import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { getAffiliateCopy, type AffiliateCopyKey } from "@/lib/affiliateCopy";
import { Link, NavLink } from "react-router-dom";

export const useAffiliateCopy = () => { const { lang } = useI18n(); return (key: AffiliateCopyKey) => getAffiliateCopy(lang, key); };

export function PublicAffiliateShell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 pt-24 md:pt-32">{children}</main><Footer /></div>;
}

export function PortalShell({ children, title }: { children: React.ReactNode; title: string }) {
  const { withLang } = useI18n(); const c = useAffiliateCopy();
  const links: [string, AffiliateCopyKey][] = [["portal","dashboard"],["empfehlungen","referrals"],["belohnungen","rewards"],["profil","profile"]];
  return <PublicAffiliateShell><div className="border-b bg-muted/40"><div className="container px-4 py-4 flex gap-2 overflow-x-auto" aria-label={c("program")}>
    {links.map(([path,key]) => <Button key={path} asChild variant="ghost" size="sm"><NavLink className={({isActive}) => isActive ? "bg-background text-primary shadow-sm" : ""} to={withLang(`/empfehlungsprogramm/${path}`)}>{c(key)}</NavLink></Button>)}
  </div></div><section className="container px-4 py-10 md:py-14"><div className="flex items-end justify-between gap-4 mb-8"><div><p className="text-sm font-semibold text-primary mb-1">{c("program")}</p><h1 className="text-3xl md:text-4xl font-bold">{title}</h1></div><Link className="hidden sm:block text-sm text-muted-foreground hover:text-primary" to={withLang("/")}>{c("backHome")}</Link></div>{children}</section></PublicAffiliateShell>;
}
