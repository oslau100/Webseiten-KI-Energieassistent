import { useState } from "react";
import Reveal from "@/components/Reveal";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Brauche ich Vorerfahrung oder spezielles Wissen?",
    answer:
      "Nein. Du musst weder aus der Energiebranche kommen noch technische Vorkenntnisse mitbringen. Im persönlichen Onboarding und in unserer Academy bekommst du alles, was du für den Start brauchst – während große Teile des Geschäftsmodells bereits automatisiert ablaufen.",
  },
  {
    question: "Wie viel Zeit muss ich investieren?",
    answer:
      "Durch den hohen Automatisierungsgrad lässt sich der Energieassistent auch nebenberuflich betreiben. Du kannst bereits mit etwa einer Stunde täglichem Eigenaufwand starten und deinen Einsatz später flexibel an deine Ziele anpassen.",
  },
  {
    question: "Muss ich Software, Webseiten oder Automationen selbst aufbauen?",
    answer:
      "Nein. Energieassistent, Funnel, CRM und zentrale Automationen sind bereits entwickelt und werden für deine Marke eingerichtet. Du musst weder programmieren noch verschiedene Tools selbst miteinander verbinden.",
  },
  {
    question: "Was ist, wenn ich noch kein Gewerbe oder Unternehmen habe?",
    answer:
      "Kein Problem. Auch wenn du noch nicht selbstständig bist, begleiten wir dich durch die notwendigen organisatorischen Schritte für deinen Start und zeigen dir, was du für die Gewerbeanmeldung benötigst.",
  },
  {
    question: "Wie schnell kann ich mit meinem Energieassistenten starten?",
    answer:
      "Nach deinem persönlichen Onboarding übernehmen wir die technische Einrichtung. In der Regel ist dein eigener Energieassistent innerhalb von etwa 7 Tagen startbereit, sodass du anschließend mit der Nutzergewinnung beginnen kannst.",
  },
  {
    question: "Wie gewinne ich Nutzer für meinen Energieassistenten?",
    answer:
      "Dafür stehen dir unsere vorbereiteten Systeme für Content, Ads und Empfehlungen zur Verfügung. So kannst du unterschiedliche Wege zur Nutzergewinnung nutzen, ohne jeden Prozess von Grund auf selbst entwickeln zu müssen.",
  },
  {
    question: "Wie verdiene ich mit dem Energieassistenten Geld?",
    answer:
      "Für deine Nutzer ist der Energieassistent kostenlos. Wird eine gefundene Ersparnis angenommen und der Wechsel bestätigt, entsteht eine Vermittlungsvergütung – im Durchschnitt erhältst du daraus rund 150–200 €.",
  },
  {
    question: "Gehören die Nutzer und ihre Daten mir?",
    answer:
      "Ja. Du baust deinen eigenen Nutzerbestand unter deiner eigenen Marke auf. Die Nutzer- und Vorgangsdaten stehen dir in deinem CRM zur Verfügung und können exportiert werden; wir stellen als Plattformanbieter lediglich die technische Infrastruktur bereit und verarbeiten die Daten im Rahmen des vereinbarten AVV.",
  },
  {
    question: "Wie werden Datenschutz und Datensicherheit gewährleistet?",
    answer:
      "Unsere Plattform wird in Deutschland entwickelt und die Daten werden auf Servern in Frankfurt am Main verarbeitet. Als deutsche GmbH arbeiten wir nach den Anforderungen der DSGVO und schließen mit unseren Partnern einen Auftragsverarbeitungsvertrag (AVV) für die Datenverarbeitung ab.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white px-6 py-24 md:py-32">
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

export default FAQSection;
