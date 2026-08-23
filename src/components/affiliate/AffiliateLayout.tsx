import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { affiliateLanguages, getAffiliateLanguage, languageNames } from "@/i18n/affiliate";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";
import { affiliateDestination, safeAffiliateSearch } from "@/lib/affiliate-navigation";

export function AffiliateLayout({ children, portal = false }: { children: React.ReactNode; portal?: boolean }) {
  const location = useLocation(); const navigate = useNavigate(); const lang = getAffiliateLanguage(location.search);
  const changeLanguage = (value: string) => { const q = new URLSearchParams(safeAffiliateSearch(location.search)); q.set("lang", value); navigate(`${location.pathname}?${q}${location.hash}`); };
  return <div className="min-h-screen flex flex-col bg-white" dir={lang === "ar" ? "rtl" : "ltr"}>
    <Navbar />
    {portal && <div className="border-y bg-[#f4f5f7]"><div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-4 py-3 text-sm font-semibold">
      {[['portal','Übersicht'],['empfehlungen','Empfehlungen'],['belohnungen','Belohnungen'],['profil','Profil']].map(([path,label]) => <NavLink key={path} to={affiliateDestination(`/empfehlungsprogramm/${path}`, location.search)} className={({isActive}) => `whitespace-nowrap rounded-full px-4 py-2 ${isActive?'bg-primary':'hover:bg-white'}`}>{label}</NavLink>)}
      <UserRound className="ms-auto hidden sm:block" aria-hidden />
    </div></div>}
    <main className="flex-1">{children}</main>
    <div className="mx-auto flex w-full max-w-6xl justify-end px-4 py-5"><label className="sr-only" htmlFor="portal-language">Sprache</label><select id="portal-language" value={lang} onChange={e=>changeLanguage(e.target.value)} className="rounded-full border bg-white px-4 py-2 text-sm">{affiliateLanguages.map(code=><option key={code} value={code}>{languageNames[code]}</option>)}</select></div>
    <Footer />
  </div>;
}
