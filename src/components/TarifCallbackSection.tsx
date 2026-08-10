import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const TarifCallbackSection=()=>{
 const{t,lang,withLang}=useI18n();const{getText}=useWebsiteConfig();
 const avatarUrl=getText("sections.about.avatar_url","https://assets.cdn.filesafe.space/tn90CyE3XuYFTy4c1M3F/media/69d3fc76bc1d4a17f7def171.png",lang);const personName=getText("sections.about.person_name","Marvin Ehiogie",lang);const[avatarReady,setAvatarReady]=useState(Boolean(avatarUrl));
 useEffect(()=>setAvatarReady(Boolean(avatarUrl)),[avatarUrl]);
 const avatarAlt=personName?`${personName} – ${t("tariff_callback_avatar_alt")}`:t("tariff_callback_avatar_alt");
 return <section data-testid="tarif-callback-section" className="mx-auto mt-8 w-full max-w-6xl px-2 pb-8 sm:px-4 sm:pb-12"><div className="flex flex-col items-center gap-6 rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8 md:flex-row md:text-start"><div className="size-24 shrink-0 overflow-hidden rounded-full bg-muted sm:size-28">{avatarReady?<img src={avatarUrl} alt={avatarAlt} className="size-full object-cover" width={112} height={112} onError={()=>setAvatarReady(false)}/>:<div className="flex size-full items-center justify-center text-muted-foreground" role="img" aria-label={avatarAlt}><UserRound className="size-10" aria-hidden="true"/></div>}</div><div className="min-w-0 flex-1"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("tariff_callback_title")}</h2><p className="mt-2 text-muted-foreground">{t("tariff_callback_subtitle")}</p></div><Button asChild size="lg" className="min-h-11 w-full shrink-0 rounded-full sm:w-auto"><Link to={withLang("/rueckruf-buchen")}>{t("tariff_callback_button")}</Link></Button></div></section>;
};
