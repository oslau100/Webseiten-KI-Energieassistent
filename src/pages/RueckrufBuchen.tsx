import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CallbackBookingWidget } from "@/components/booking/CallbackBookingWidget";
import { useBookingI18n } from "@/lib/publicBookingI18n";
import { useState } from "react";
const RueckrufBuchen=()=>{const{b}=useBookingI18n();const[success,setSuccess]=useState(false);return <div className="min-h-screen bg-background text-foreground font-sans flex flex-col overflow-x-hidden"><Header/><main className="container flex-1 px-4 pb-20 pt-36 md:pt-44">{!success&&<header className="mx-auto mb-10 max-w-3xl text-center"><h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">{b.title}</h1><p className="mt-4 text-lg text-muted-foreground">{b.description}</p><p className="mt-3 text-sm font-medium text-primary">{b.costNote}</p></header>}<CallbackBookingWidget onSuccessChange={setSuccess}/></main><Footer/></div>};
export default RueckrufBuchen;
