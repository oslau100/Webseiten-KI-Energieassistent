import { useState } from "react";
import Reveal from "@/components/Reveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Muss ich mich um Technik oder Einrichtung kümmern?",
    answer:
      "Nein. Das komplette System wird für dich eingerichtet – von der Landingpage über die Tarifprüfung bis hin zum CRM und den Follow-ups. Du musst dich um nichts Technisches kümmern.",
  },
  {
    question: "Kann ich festlegen, welche Tarife bevorzugt empfohlen werden?",
    answer:
      "Ja. In deinem System kannst du aus den verfügbaren Distributionstarifen (zb. von Stromkreis, Ennux und Energiespardienst24) jederzeit bis zu drei Prioritäten festlegen. Der Energieassistent berücksichtigt diese Reihenfolge automatisch bei der Tarifempfehlung. Ist die erste Priorität für einen Interessenten nicht verfügbar oder nicht geeignet, wird automatisch die nächste Priorität berücksichtigt. Alle Preisänderungen und Tarife werden automatisch aktualisiert.",
  },
  {
    question: "Funktioniert das System auch, wenn ich ein Team oder eine Agentur habe?",
    answer:
      "Ja, das System funktioniert problemlos auch mit mehreren Mitarbeitern oder im Agentur-Setup. Wir richten für dich ein individuelles Tracking ein, sodass alle Anfragen und Abschlüsse klar einzelnen Mitarbeitern zugeordnet werden können. So kann dein gesamtes Team mit dem System arbeiten, ohne dass Übersicht oder Kontrolle verloren geht.",
  },
  {
    question: "Funktioniert das auch, wenn ich bereits eine eigene Webseite habe?",
    answer:
      "Ja, das ist kein Problem. Wir können das System entweder in deine bestehende Webseite integrieren oder deine aktuelle Seite durch das System ersetzen – je nachdem, was für deine Situation mehr Sinn macht. In beiden Fällen wird alles sauber für dich eingerichtet und funktioniert nahtlos.",
  },
  {
    question: "Wie schnell sehe ich erste Ergebnisse?",
    answer:
      "In der Regel ist dein System innerhalb weniger Wochen vollständig aufgebaut und einsatzbereit. Erste qualifizierte Anfragen und Abschlüsse können bereits kurz nach dem Start entstehen.",
  },
  {
    question: "Ist das System DSGVO-konform und wo werden die Daten gehostet?",
    answer:
      "Ja. Unsere Plattform wird vollständig in Deutschland gehostet und personenbezogene Daten werden nach den Vorgaben der DSGVO verarbeitet.",
  },
];

const AdsFAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        {/* Headline */}
        <Reveal className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal tracking-tight leading-tight text-gray-900">
            Häufig gestellte Fragen
          </h2>
        </Reveal>

        {/* FAQ list */}
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={index} delay={0.05 * Math.min(index + 1, 4)}>
                <div className="py-5 md:py-6">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-6 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base md:text-lg font-medium text-gray-900 leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className={`shrink-0 flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${
                        isOpen
                          ? "bg-[#1a5147] border-[#1a5147] text-white rotate-45"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 3v10M3 8h10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pr-8 text-sm md:text-base text-gray-600 leading-relaxed font-normal">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdsFAQSection;
