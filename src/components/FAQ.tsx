import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqs = [
    {
      question: "Muss ich mich um Technik oder Einrichtung kümmern?",
      answer: "Nein. Das komplette System wird für dich eingerichtet – von der Landingpage über die Tarifprüfung bis hin zum CRM und den Follow-ups. Du musst dich um nichts Technisches kümmern."
    },
    {
      question: "Wie funktioniert die Tarifauswahl und welche Anbieter werden berücksichtigt?",
      answer: "Im System werden gängige Anbieter und Tarife aus Distributionen wie Stromkreis, Neue Energie, Energiespardienst24, Ennux, u. v. m. berücksichtigt – inklusive automatisch aktualisierter Preise.\nDu kannst jederzeit festlegen, welche Tarife priorisiert angezeigt werden sollen.\n\nSo erhält jeder Interessent automatisch ein passendes und aktuelles Angebot, ohne dass du manuell eingreifen musst."
    },
    {
      question: "Funktioniert das System auch, wenn ich ein Team oder eine Agentur habe?",
      answer: "Ja, das System funktioniert problemlos auch mit mehreren Mitarbeitern oder im Agentur-Setup. Wir richten für dich ein individuelles Tracking ein, sodass alle Anfragen und Abschlüsse klar einzelnen Mitarbeitern zugeordnet werden können. So kann dein gesamtes Team mit dem System arbeiten, ohne dass Übersicht oder Kontrolle verloren geht."
    },
    {
      question: "Funktioniert das auch, wenn ich bereits eine eigene Webseite habe?",
      answer: "Ja, das ist kein Problem. Wir können das System entweder in deine bestehende Webseite integrieren oder deine aktuelle Seite durch das System ersetzen – je nachdem, was für deine Situation mehr Sinn macht. In beiden Fällen wird alles sauber für dich eingerichtet und funktioniert nahtlos."
    },
    {
      question: "Wie schnell sehe ich erste Ergebnisse?",
      answer: "In der Regel ist dein System innerhalb weniger Wochen vollständig aufgebaut und einsatzbereit. Erste qualifizierte Anfragen und Abschlüsse können bereits kurz nach dem Start entstehen."
    }
  ];

  return (
    <section className="bg-[#FDFDFD] py-20 text-slate-900">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl font-bold text-center mb-12 text-[#1a231c]">Häufig gestellte Fragen</h2>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`} 
              className="border border-slate-100/50 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl px-6"
            >
              <AccordionTrigger className="text-left text-base sm:text-lg font-normal hover:no-underline py-6 [&[data-state=open]>svg]:rotate-45">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 text-base pb-6 whitespace-pre-line">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
