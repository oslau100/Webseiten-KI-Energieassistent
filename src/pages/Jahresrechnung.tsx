import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { XCircle, AlertCircle, Check, Star } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { About } from "@/components/About";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { GetReviewWidget } from "@/components/GetReviewWidget";

type Item = { title: string; desc: string; step?: string };
type Review = { name: string; title: string; text: string };

export default function Jahresabrechnung() {
  const { t, lang, withLang } = useI18n();
  const { getText, getArray } = useWebsiteConfig();
  const mainWidgetId = getText("integrations.google_reviews.main_widget_id", "");
  const hasMainWidget = Boolean(mainWidgetId.trim());
  const htmlOverride = getText("pages.jahresrechnung.html", "");

  if (htmlOverride) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Header />
        <main className="container mx-auto px-4 pt-36 md:pt-48 pb-16 max-w-6xl">
          <div dangerouslySetInnerHTML={{ __html: htmlOverride }} />
        </main>
        <Footer />
      </div>
    );
  }

  const processFallback: Item[] = [
    { step: "1", title: "Rechnungsprüfung starten", desc: "Klicke dich durch ein paar kurze Fragen zu deinem Haushalt und lade deine Jahresabrechnung hoch." },
    { step: "2", title: "Individuelle Analyse", desc: "Wir analysieren deine Jahresabrechnung im Detail und prüfen, ob Auffälligkeiten, Fehler oder unnötige Kosten enthalten sind." },
    { step: "3", title: "Ergebnis erhalten", desc: "Du erhältst eine klare und verständliche Auswertung deiner Jahresabrechnung – inklusive möglicher Auffälligkeiten und Einsparpotenziale." },
    { step: "4", title: "Konkrete Handlungsempfehlung", desc: "Auf Basis der Analyse zeigen wir, welche nächsten Schritte sinnvoll sind – z. B. Abschläge anpassen, Fehler korrigieren oder Einsparmöglichkeiten nutzen." },
  ];

  const whyFallback: Item[] = [
    { title: "Geschätzte Zählerstände", desc: "Wenn kein aktueller Zählerstand gemeldet wird, schätzt der Anbieter den Verbrauch. Diese Schätzungen können deutlich vom tatsächlichen Verbrauch abweichen." },
    { title: "Abschläge wurden falsch berechnet", desc: "Manchmal sind monatliche Abschläge zu niedrig oder zu hoch angesetzt das fällt vielen erst mit der Jahresabrechnung auf." },
    { title: "Tarifpreise haben sich geändert", desc: "Viele Tarife werden nach Ablauf der Preisgarantie oder durch Preisänderungen deutlich teurer. Ohne genaue Prüfung bleibt das oft unbemerkt." },
    { title: "Rechnungen sind schwer verständlich", desc: "Strom- und Gasrechnungen enthalten viele Positionen und Abkürzungen - dadurch ist es für viele Haushalte schwer zu erkennen, ob alles korrekt ist." },
  ];

  const comparisonSelfFallback = [
    "Du musst alle Positionen und Abkürzungen in deiner Rechnung selbst verstehen.",
    "Du musst prüfen, ob Verbrauch, Preise und Abschläge korrekt berechnet wurden.",
    "Du musst mögliche Schätzungen oder ungewöhnliche Kosten selbst erkennen.",
    "Du musst selbst beurteilen, ob deine Rechnung wirklich korrekt ist.",
    "Du musst Zeit investieren, um die gesamte Rechnung im Detail zu analysieren.",
  ];

  const comparisonAssistantFallback = [
    "Professionelle Prüfung durch uns",
    "Wir analysieren deine Jahresabrechnung im Detail und prüfen alle relevanten Positionen.",
    "Du erhältst eine klare und verständliche Auswertung deiner Rechnung.",
    "Wir zeigen konkrete Handlungsempfehlungen für die nächsten Schritte.",
    "Du erhältst ein verlässliches Ergebnis – ohne selbst Zeit investieren zu müssen.",
  ];

  const reviewsFallback: Review[] = [
    { name: "Lisa K.", title: "Ich hatte erst eine Nachzahlung...", text: "Ich hatte erst eine Nachzahlung von über 1420 €. Durch die Prüfung habe ich gesehen, dass mein Zählerstand geschätzt wurde. Nachdem ich das korrigiert habe, waren es am Ende nur noch 680 €. Hat sich also wirklich gelohnt." },
    { name: "Tom S.", title: "Bei meiner Rechnung war zwar...", text: "Bei meiner Rechnung war zwar alles korrekt, aber ich habe trotzdem Hinweise bekommen, wie ich meinen Abschlag besser einstellen kann. Das fand ich wirklich sinnvoll." },
    { name: "Manny O.", title: "Ich habe meine Gasrechnung nie...", text: "Ich habe meine Gasrechnung nie richtig verstanden. Die Auswertung hier war viel einfacher zu lesen als die eigentliche Rechnung." },
    { name: "Hendrik M.", title: "Rechnung hochgeladen und nach...", text: "Rechnung hochgeladen und nach kurzer Zeit eine Auswertung bekommen. Fand ich wirklich praktisch, weil ich sonst gar nicht wüsste, worauf man achten muss." },
  ];

  const processItems = getArray<Item>(`sections.jahresrechnung.process.${lang}`, getArray<Item>("sections.jahresrechnung.process", processFallback));
  const whyItems = getArray<Item>(`sections.jahresrechnung.why.${lang}`, getArray<Item>("sections.jahresrechnung.why", whyFallback));
  const comparisonSelf = getArray<string>(`sections.jahresrechnung.comparison_self.${lang}`, getArray<string>("sections.jahresrechnung.comparison_self", comparisonSelfFallback));
  const comparisonAssistant = getArray<string>(`sections.jahresrechnung.comparison_assistant.${lang}`, getArray<string>("sections.jahresrechnung.comparison_assistant", comparisonAssistantFallback));
  const reviews = getArray<Review>(`sections.jahresrechnung.reviews.${lang}`, getArray<Review>("sections.jahresrechnung.reviews", reviewsFallback));

  const annualFaqs = [
    { q: t("annual_faq_1_q"), a: t("annual_faq_1_a") },
    { q: t("annual_faq_2_q"), a: t("annual_faq_2_a") },
    { q: t("annual_faq_3_q"), a: t("annual_faq_3_a") },
    { q: t("annual_faq_4_q"), a: t("annual_faq_4_a") },
    { q: t("annual_faq_5_q"), a: t("annual_faq_5_a") },
    { q: t("annual_faq_6_q"), a: t("annual_faq_6_a") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-background">
          <div className="container px-4 mx-auto max-w-7xl"><div className="flex flex-col items-center text-center max-w-4xl mx-auto z-10"><AnimatedSection delay={100} className="w-full flex justify-center"><div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-[11px] sm:text-sm font-semibold mb-8 whitespace-nowrap"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary shrink-0" />{getText("sections.jahresrechnung.badge", "Bereits 2.000+ zufriedene Nutzer in ganz Deutschland", lang)}</div></AnimatedSection><AnimatedSection delay={200}><h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">{t("annual_hero_h1")}</h1></AnimatedSection><AnimatedSection delay={300}><p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">{getText("sections.jahresrechnung.hero_text", "Finde heraus, ob deine Jahresabrechnung wirklich korrekt ist. Wir analysieren deine Abrechnung im Detail und zeigen dir transparent, ob alles stimmt.", lang)}</p></AnimatedSection><AnimatedSection delay={400} className="w-full flex justify-center"><div className="flex flex-col items-center gap-4"><Button size="lg" asChild className="w-full sm:w-auto text-lg h-16 px-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button><span className="text-sm text-muted-foreground">{getText("sections.jahresrechnung.free_note", "100% kostenlos", lang)}</span></div></AnimatedSection></div></div>
        </section>
        <section className="bg-muted/30 py-20"><div className="container mx-auto px-4 text-center"><AnimatedSection><h2 className="text-3xl md:text-4xl font-bold mb-16">{t("annual_process_h2")}</h2></AnimatedSection><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto text-left mb-16">{processItems.map((item,i)=><AnimatedSection key={i} delay={i*100} className="h-full"><div className="flex flex-col items-start p-6 bg-card rounded-2xl shadow-sm border border-border/50 h-full"><div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-6 shadow-md">{item.step || String(i+1)}</div><h3 className="text-xl font-bold mb-3">{item.title}</h3><p className="text-muted-foreground leading-relaxed">{item.desc}</p></div></AnimatedSection>)}</div><AnimatedSection delay={400}><Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button></AnimatedSection></div></section>
        <section className="py-20"><div className="container mx-auto px-4 text-center"><AnimatedSection><h2 className="text-3xl md:text-4xl font-bold mb-6 max-w-2xl mx-auto">{t("annual_why_h2")}</h2><p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-16">{getText("sections.jahresrechnung.why_intro", "Viele Haushalte zahlen unnötig nach oder haben falsche Abschläge oft nur, weil kleine Fehler oder Änderungen in der Rechnung unbemerkt bleiben.", lang)}</p></AnimatedSection><div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-16 text-left">{whyItems.map((item,i)=><AnimatedSection key={i} delay={i*100} className="h-full"><div className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full"><div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4"><AlertCircle className="w-5 h-5" /></div><h3 className="text-xl font-bold mb-3">{item.title}</h3><p className="text-muted-foreground">{item.desc}</p></div></AnimatedSection>)}</div></div></section>
        <section className="bg-primary text-primary-foreground py-12 md:py-20 px-4 text-center"><div className="container mx-auto max-w-4xl"><AnimatedSection><h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">{t("annual_blue_value_h2")}</h2><p className="text-base md:text-xl opacity-90 mb-6 md:mb-10 max-w-2xl mx-auto">{getText("sections.jahresrechnung.value_text", "Wir übernehmen das für dich und zeigen dir, ob deine Jahresabrechnung wirklich korrekt ist.", lang)}</p><div className="flex flex-col items-center"><Button size="lg" asChild variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 text-primary hover:text-primary font-bold shadow-lg"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button><span className="text-xs opacity-80 mt-2 italic">{getText("sections.jahresrechnung.free_note", "100% kostenlos", lang)}</span></div></AnimatedSection></div></section>
        <section className="py-24"><div className="container mx-auto px-4 text-center"><AnimatedSection><h2 className="text-3xl md:text-4xl font-bold mb-16">{t("annual_comparison_h2")}</h2></AnimatedSection><div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16"><AnimatedSection animation="fade-right" className="h-full"><div className="bg-muted/50 rounded-3xl p-8 md:p-12 text-left border h-full"><h3 className="text-2xl font-bold mb-8 text-center">{getText("sections.jahresrechnung.comparison_self_title", "Rechnung selbst prüfen", lang)}</h3><ul className="space-y-6">{comparisonSelf.map((text,i)=><li key={i} className="flex items-start gap-4"><XCircle className="w-6 h-6 text-muted-foreground shrink-0 mt-0.5" /><span className="text-muted-foreground leading-relaxed">{text}</span></li>)}</ul></div></AnimatedSection><AnimatedSection animation="fade-left" delay={200} className="h-full"><div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-12 text-left shadow-xl relative overflow-hidden h-full"><div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div><h3 className="text-2xl font-bold mb-8 text-center relative z-10">{getText("sections.jahresrechnung.comparison_assistant_title", "Mit Energieassistent", lang)}</h3><ul className="space-y-6 relative z-10">{comparisonAssistant.map((text,i)=><li key={i} className="flex items-start gap-4"><div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-4 h-4 text-white" /></div><span className="opacity-90 leading-relaxed">{text}</span></li>)}</ul></div></AnimatedSection></div><AnimatedSection delay={400}><Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button></AnimatedSection></div></section>
        <section className="bg-muted/30 py-24"><div className="container mx-auto px-4 text-center"><AnimatedSection><p className="text-primary font-semibold mb-2">{getText("sections.jahresrechnung.reviews_kicker", "Das sagen unsere Nutzer", lang)}</p><h2 className="text-3xl md:text-4xl font-bold mb-16 max-w-3xl mx-auto">{t("annual_testimonials_h2")}</h2></AnimatedSection><AnimatedSection delay={200}><div className="max-w-5xl mx-auto px-4 md:px-12 relative mb-16">{hasMainWidget ? <GetReviewWidget widgetId={mainWidgetId} /> : <Carousel opts={{ align: "start" }} className="w-full"><CarouselContent>{reviews.map((review,i)=><CarouselItem key={i} className="basis-[85%] md:basis-1/2 lg:basis-1/2 pl-4"><div className="p-1 h-full"><Card className="h-full border shadow-sm bg-card rounded-2xl"><CardContent className="flex flex-col h-full p-8 text-left"><div className="flex gap-1 text-[#16a34a] mb-4">{[1,2,3,4,5].map((star)=><Star key={star} className="w-5 h-5 fill-current border-none" />)}</div><h4 className="text-xl font-bold mb-3">{review.title}</h4><p className="text-muted-foreground leading-relaxed mb-4">{review.text}</p><p className="font-semibold text-foreground">{review.name}</p></CardContent></Card></div></CarouselItem>)}</CarouselContent><CarouselPrevious className="hidden md:flex -left-12 h-12 w-12 border shadow-md bg-background" /><CarouselNext className="hidden md:flex -right-12 h-12 w-12 border shadow-md bg-background" /></Carousel>}</div></AnimatedSection><AnimatedSection delay={400}><Button size="lg" asChild className="text-lg px-8 py-6 shadow-lg"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button></AnimatedSection></div></section>
        <About />
        <section className="py-24"><div className="container mx-auto px-4 max-w-3xl"><AnimatedSection><h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{t("annual_faq_h2")}</h2></AnimatedSection><AnimatedSection delay={200}><Accordion type="single" collapsible className="w-full space-y-4">{annualFaqs.map((faq,i)=><AccordionItem key={i} value={`item-${i}`} className="bg-muted/30 border px-6 rounded-lg"><AccordionTrigger className="text-left font-medium text-lg py-6 hover:no-underline hover:text-primary transition-colors">{faq.q}</AccordionTrigger><AccordionContent className="text-muted-foreground leading-relaxed pb-6">{faq.a}</AccordionContent></AccordionItem>)}</Accordion></AnimatedSection></div></section>
        <section className="bg-primary text-primary-foreground py-12 md:py-20 px-4 text-center"><div className="container mx-auto max-w-3xl"><AnimatedSection><h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">{t("annual_final_cta_h2")}</h2><p className="text-base md:text-xl opacity-90 mb-6 md:mb-10">{getText("sections.jahresrechnung.final_text", "Der Energieassistent analysiert deine Rechnung automatisch und zeigt dir sofort, ob alles korrekt ist oder ob du etwas prüfen solltest.", lang)}</p><Button size="lg" asChild variant="secondary" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 text-primary hover:text-primary font-bold shadow-lg"><Link to={withLang("/rechnung")}>{getText("sections.jahresrechnung.cta", "Jahresabrechnung prüfen", lang)}</Link></Button></AnimatedSection></div></section>
      </main>
      <Footer />
    </div>
  );
}
