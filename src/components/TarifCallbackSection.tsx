import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle,Phone,UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

const CALLBACK_PHONE_DISPLAY="0241 51002925";
const CALLBACK_PHONE_TEL="+4924151002925";
const WHATSAPP_URL="https://api.whatsapp.com/send/?phone=4924151002925&text=Hallo%20%C3%96cher%20Strom%2C%20ich%20habe%20meine%20Tarifempfehlung%20erhalten%20und%20habe%20noch%20Fragen.&type=phone_number&app_absent=0";

export const TarifCallbackSection=()=>{
 const{t,lang}=useI18n();const{getText}=useWebsiteConfig();
 const avatarUrl=getText("sections.about.avatar_url","/brand/avatar.webp",lang);const personName=getText("sections.about.person_name","Öcher Strom",lang);const[avatarReady,setAvatarReady]=useState(Boolean(avatarUrl));
 useEffect(()=>setAvatarReady(Boolean(avatarUrl)),[avatarUrl]);
 const avatarAlt=personName?`${personName} – ${t("tariff_callback_avatar_alt")}`:t("tariff_callback_avatar_alt");
 return <section data-testid="tarif-callback-section" className="mx-auto mt-8 w-full max-w-6xl px-2 pb-8 sm:px-4 sm:pb-12"><div className="flex flex-col items-stretch gap-6 rounded-3xl border bg-background p-6 text-center shadow-sm sm:p-8"><div className="flex flex-col items-center gap-6 sm:flex-row sm:text-start"><div className="size-24 shrink-0 overflow-hidden rounded-full bg-muted sm:size-28">{avatarReady?<img src={avatarUrl} alt={avatarAlt} className="size-full object-cover" width={112} height={112} onError={()=>setAvatarReady(false)}/>:<div className="flex size-full items-center justify-center text-muted-foreground" role="img" aria-label={avatarAlt}><UserRound className="size-10" aria-hidden="true"/></div>}</div><div className="min-w-0 flex-1"><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("tariff_callback_title")}</h2><p className="mt-2 text-muted-foreground">{t("tariff_callback_subtitle")}</p></div></div><div data-testid="tarif-callback-actions" className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"><Button asChild variant="outline" size="lg" className="min-h-11 w-full rounded-full font-[950]"><a href={`tel:${CALLBACK_PHONE_TEL}`}><Phone aria-hidden="true"/>{t("tariff_callback_call_button")} {CALLBACK_PHONE_DISPLAY}</a></Button><Button asChild size="lg" className="min-h-11 w-full rounded-full font-[950]"><Link to="/rueckruf-buchen">{t("tariff_callback_button")}</Link></Button><Button asChild variant="outline" size="lg" className="min-h-11 w-full rounded-full font-[950] sm:col-span-2 sm:w-1/2 sm:justify-self-center lg:col-span-1 lg:w-full"><a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true"/>{t("tariff_callback_whatsapp_button")}</a></Button></div></div></section>;
};
