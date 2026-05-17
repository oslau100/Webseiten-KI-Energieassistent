import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";

export const HowItWorks = () => {
  const { t, withLang } = useI18n();
  const steps = [
    { title: "Ersparnisprüfung starten", description: "Klicke dich einfach durch ein paar kurze Fragen zu deinem Tarif und Haushalt, damit der Energieassistent deine Situation prüfen kann." },
    { title: "Automatische Analyse", description: "Der Energieassistent analysiert mithilfe von KI verfügbare Tarife in deiner Region und filtert Lockangebote, riskante Anbieter sowie versteckte Vertragsfallen für dich heraus." },
    { title: "Tarifempfehlung erhalten", description: "Statt einer langen Tarifliste erhältst du eine sichere Empfehlung mit möglicher Ersparnis inklusive Erklärung, warum dieser Tarif eine sichere Wahl ist." },
    { title: "Wechsel & Tarifüberwachung", description: "Wenn dir der empfohlene Tarif zusagt, übernimmt der Energieassistent den Wechsel für dich, überwacht deine Kündigungsfristen und meldet sich automatisch, sobald ein erneuter Wechsel sinnvoll ist." },
  ];
  return (<section className="py-16 md:py-24 bg-muted/30"><div className="container px-4 md:px-6"><AnimatedSection className="text-center max-w-3xl mx-auto mb-16"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("home_how_it_works_h2")}</h2></AnimatedSection><div className="max-w-4xl mx-auto space-y-12">{steps.map((step,index)=><AnimatedSection key={index} delay={index*150} className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center"><div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/30">{index+1}</div><div className="space-y-2"><h3 className="text-xl md:text-2xl font-bold">{step.title}</h3><p className="text-muted-foreground leading-relaxed md:text-lg">{step.description}</p></div></AnimatedSection>)}</div><AnimatedSection delay={400} className="mt-16 text-center"><Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/20" asChild><Link to={withLang("/start")}>{t("cta_check_savings")}</Link></Button></AnimatedSection></div></section>);
};
