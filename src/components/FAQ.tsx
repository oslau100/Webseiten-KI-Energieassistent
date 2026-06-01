import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebsiteConfig } from "@/lib/websiteConfig";

type FaqItem = { question: string; answer: string };

export const FAQ = () => {
  const { t, withLang, lang } = useI18n();
  const { getArray, getText } = useWebsiteConfig();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const fallbackFaqs: FaqItem[] = [
    {
      question: "Wie funktioniert die Tarifprüfung genau?",
      answer:
        "Der Energieassistent analysiert deine aktuellen Tarifdaten und vergleicht diese automatisch mit hunderten verfügbaren Angeboten auf dem Markt. Dabei werden Lockangebote und riskante Anbieter direkt herausgefiltert.",
    },
    {
      question: "Welche Aufgaben übernimmt der Energieassistent für mich?",
      answer:
        "Wir überwachen deine Kündigungsfristen, prüfen regelmäßig den Markt auf bessere Angebote und übernehmen den kompletten Wechselprozess für dich, sobald ein neuer Tarif sinnvoll ist.",
    },
    {
      question: "Ist die Tarifprüfung wirklich kostenlos?",
      answer: "Ja, die Prüfung deiner aktuellen Situation und die erste Empfehlung sind komplett kostenlos und unverbindlich.",
    },
    {
      question: "Sind meine Daten bei der Prüfung sicher?",
      answer:
        "Absolut. Wir legen höchsten Wert auf Datenschutz und verarbeiten deine Angaben ausschließlich verschlüsselt nach den aktuellen DSGVO-Richtlinien.",
    },
    {
      question: "Kann es beim Wechsel zu einer Unterbrechung der Versorgung kommen?",
      answer:
        "Nein, eine Unterbrechung der Strom- oder Gasversorgung ist gesetzlich ausgeschlossen. Der Wechsel verläuft für dich nahtlos im Hintergrund.",
    },
    {
      question: "An wen kann ich mich wenden, wenn ich Fragen habe?",
      answer:
        "Unser Kundenservice steht dir jederzeit per E-Mail oder telefonisch zur Verfügung. Die Kontaktdaten findest du im Fußbereich dieser Seite.",
    },
  ];

  const faqs = getArray<FaqItem>(`sections.faq.home_items.${lang}`, getArray<FaqItem>("sections.faq.home_items", fallbackFaqs));

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("home_faq_h2")}</h2>
        </AnimatedSection>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="border rounded-xl bg-muted/30 px-6">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between py-6 font-semibold text-lg text-left hover:underline"
                    aria-expanded={isOpen}
                  >
                    {faq.question}
                    <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
                  </button>
                  <div className={cn("grid transition-all duration-200 ease-in-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                    <div className="overflow-hidden">
                      <div className="text-muted-foreground text-base leading-relaxed pb-6">{faq.answer}</div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
        <AnimatedSection delay={300} className="mt-24 bg-primary text-primary-foreground rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl leading-tight">{getText("sections.final_cta.headline", t("home_final_cta_h2"), lang)}</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed">
              {getText(
                "sections.final_cta.subline",
                "Prüfe in nur 60 Sekunden, ob und wie viel du aktuell sparen könntest.",
                lang,
              )}
            </p>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold w-full sm:w-auto shadow-lg text-primary" asChild>
              <Link to={withLang("/start")}>{getText("sections.final_cta.cta_text", t("cta_check_savings"), lang)}</Link>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
