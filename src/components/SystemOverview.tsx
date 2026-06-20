import { useState } from "react";
import { Badge } from "./ui/badge";
import { Check, ChevronUp } from "lucide-react";

const steps = [
  {
    id: "einstieg",
    label: "Start",
    title: "Neugier statt Verkaufsdruck",
    description:
      "Der Energieassistent weckt bereits beim ersten Kontakt Neugier und führt Interessenten dazu, ihre mögliche Ersparnis in nur 60 Sekunden zu prüfen – mit sofortigem Ergebnis.",
    features: [
        "Interessenten prüfen ihre Ersparnis in 60 Sekunden",
        "Sofortiges Ergebnis statt langem Verkaufsprozess",
        "Niedrige Hürden statt klassischer Verkaufsansprache",
    ],
  },
  {
    id: "pruefung",
    label: "Prüfung",
    title: "Der Energieassistent übernimmt die Tarifprüfung",
    description:
      "Interessenten geben ihre aktuellen Tarifdaten mit wenigen Klicks ein. Basierend darauf wird automatisch ein passender Tarif aus priorisierten Distributionstarifen ausgewählt.",
    features: [
      "Tarife und Anbieter können täglich priorisiert werden",
      "Der Energieassistent berücksichtigt automatisch deine Prioritäten",
      "Mehrsprachig aufgebaut für maximale Reichweite",
    ],
  },
  {
    id: "empfehlung",
    label: "Empfehlung",
    title: "Vertrauen statt weiterer Vergleiche",
    description:
      "Der Energieassistent berät Interessenten automatisch, erklärt verständlich, warum der vorgeschlagene Tarif sinnvoll ist und beantwortet typische Einwände.",
    features: [
      "Verständliche Erklärung zur Tarifauswahl",
      "Automatische Einwandbehandlung",
      "Vertrauen statt Zweifel oder Misstrauen",
    ],
  },
  {
    id: "abschluss",
    label: "Abschluss",
    title: "Verträge werden direkt digital abgeschlossen",
    description:
      "Interessenten können den vorgeschlagenen Tarif direkt über den Energieassistenten abschließen – ohne manuelle Nachbearbeitung oder zusätzlichen Aufwand im Vertrieb.",
    features: [
      "Abschluss direkt über den Energieassistenten",
      "Alle relevanten Daten werden digital übermittelt",
      "Weniger manueller Vertriebsaufwand",
    ],
  },
  {
    id: "follow-up",
    label: "Follow-Up",
    title: "Der Energieassistent fasst automatisch nach",
    description:
      "Unentschlossene Interessenten werden automatisiert weiter begleitet, erinnert und erneut aktiviert – ohne dass du selbst nachfassen musst.",
    features: [
      "Automatisierte E-Mail-Prozesse im Hintergrund",
      "Mehr Abschlüsse aus bestehenden Kontakten",
      "Kein Interessent geht verloren",
    ],
  },
  {
    id: "betreuung",
    label: "Betreuung",
    title: "Bestehende Kunden werden automatisch weiter betreut",
    description:
      "Sobald ein erneuter Wechsel möglich ist, arbeitet der Energieassistent automatisch weiter und spricht bestehende Kunden erneut an.",
    features: [
      "Kein Kunde wird vergessen",
      "Wiederkehrende Abschlüsse ohne neue Akquise",
      "Laufende Betreuung vollständig automatisiert",
    ],
  },
];

export const SystemOverview = () => {
  const [activeTab, setActiveTab] = useState(steps[0].id);

  const activeStep = steps.find((step) => step.id === activeTab) || steps[0];

  return (
    <section className="py-20 md:py-32 bg-[#FDFDFD] overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[22px] min-[375px]:text-[26px] sm:text-4xl md:text-4xl lg:text-5xl font-bold text-[#1a231c] leading-tight">
            So arbeitet dein <span className="text-[#2a9d4f]">Energieassistent</span> <br className="hidden md:block" />
            in 6 einfachen Schritten
          </h2>
        </div>

        {/* Tabs */}
        <div className="relative w-full">
          <div className="flex overflow-x-auto gap-3 md:gap-4 mb-4 md:mb-16 pb-4 scrollbar-hide justify-start lg:justify-center w-full px-2 snap-x">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setActiveTab(step.id)}
                className={`px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold whitespace-nowrap transition-all duration-300 shrink-0 snap-center ${
                  activeTab === step.id
                    ? "bg-[#000000] text-white border border-white/20 shadow-lg scale-105"
                    : "bg-[#000000] text-white/90 hover:text-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>
          
          {/* Scroll Indicator Mobile */}
          <div className="flex items-center justify-center gap-1.5 mb-10 lg:hidden text-[#1a231c]/50 text-sm font-medium animate-pulse">
            <span>Wischen für mehr</span>
            <ChevronUp className="w-4 h-4" />
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 lg:p-16 overflow-hidden min-h-[380px] flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100/50">
          <div 
            key={activeStep.id}
            className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out"
          >
            {/* Left Column: Text */}
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a231c] leading-tight">
                {activeStep.title}
              </h3>
              <p className="text-[#1a231c]/90 text-lg md:text-xl font-medium leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            {/* Right Column: Features */}
            <div className="space-y-6 md:space-y-8">
              {activeStep.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex gap-4 items-start animate-in fade-in slide-in-from-right-4 fill-mode-both"
                  style={{ animationDelay: `${index * 150}ms`, animationDuration: '500ms' }}
                >
                  <div className="flex items-center justify-center shrink-0 mt-0.5 transition-transform hover:scale-110 duration-300">
                    <Check
                      className="w-6 h-6 md:w-7 md:h-7 text-[#2a9d4f]"
                      strokeWidth={4}
                    />
                  </div>
                  <p className="text-[#1a231c] font-medium text-base md:text-lg leading-snug">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hide Scrollbar for Tabs Component */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};
