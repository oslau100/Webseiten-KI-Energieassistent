import { relaunchAssets } from "@/lib/relaunchAssets";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Lightbulb,
  MessageCircle,
  FileCheck,
  LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";

interface FunnelTab {
  id: string;
  title: string;
  shortSubtitle: string;
  description: string;
  gifUrl: string;
  icon: LucideIcon;
}

const funnelSteps: FunnelTab[] = [
  {
    id: "tarifpruefung",
    title: "Tarifprüfung",
    shortSubtitle: "Wenige Angaben statt Rechnung und Unterlagen.",
    description:
      "Interessenten klicken sich mit wenigen einfachen Angaben durch die Tarifprüfung. Die Abfrage passt sich dynamisch an ihre Angaben an – ohne Rechnung, ohne Unterlagen und völlig unverbindlich, in mehreren Sprachen.",
    gifUrl:
      relaunchAssets.funnel.check,
    icon: ClipboardList,
  },
  {
    id: "tarifempfehlung",
    title: "Tarifempfehlung",
    shortSubtitle: "Persönliches Ergebnis wird direkt angezeigt.",
    description:
      "Deine Distributionstarife können direkt im automatisierten Prozess empfohlen werden. Du legst fest, welcher Tarif priorisiert werden soll – der Energieassistent berücksichtigt diese Vorgabe automatisch bei der Auswahl.",
    gifUrl:
      relaunchAssets.funnel.recommendation,
    icon: Lightbulb,
  },
  {
    id: "beratung",
    title: "Individuelle Beratung",
    shortSubtitle: "Individuelle Beratung direkt zur Empfehlung.",
    description:
      "Anschließend erhält der Interessent eine KI-gestützte Beratung genau zu seiner Empfehlung. Tarif, Ersparnis, Vorteile und nächste Schritte werden individuell erklärt; typische Fragen und Einwände werden direkt aufgegriffen.",
    gifUrl:
      relaunchAssets.funnel.advice,
    icon: MessageCircle,
  },
  {
    id: "abschluss",
    title: "Digitaler Abschluss",
    shortSubtitle: "Empfohlener Tarif kann direkt angenommen werden.",
    description:
      "Passt die Empfehlung, kann der priorisierte Distributionstarif direkt digital angenommen werden. Der Interessent ergänzt die nötigen Wechseldaten, und der passende Auftrag wird anschließend automatisch erstellt.",
    gifUrl:
      relaunchAssets.funnel.signing,
    icon: FileCheck,
  },
];

const AdsFunnelSection = () => {
  const [activeTabId, setActiveTabId] = useState<string>("tarifpruefung");
  const activeStep =
    funnelSteps.find((s) => s.id === activeTabId) || funnelSteps[0];

  return (
    <section
      id="energieassistent"
      className="relative bg-background px-6 py-20 md:py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header — centered (ads page style) */}
        <div className="mb-12 flex flex-col items-center">
          <Reveal delay={0.05} className="flex justify-center">
            <p className="mb-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary">
              DEIN ENERGIEASSISTENT
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              Das System hinter niedrigen Leadkosten
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 flex justify-center">
            <p className="max-w-3xl text-center text-lg text-muted-foreground leading-relaxed">
              Der Energieassistent liefert Interessenten direkt ein persönliches
              Ergebnis und damit einen konkreten Nutzen – statt nur Kontaktdaten
              abzufragen. So sinkt die Hürde zur Tarifprüfung und es entsteht
              die Grundlage für niedrige Leadkosten.
            </p>
          </Reveal>
        </div>

        {/* Horizontal Funnel Tabs (horizontal scroll on all viewports) */}
        <Reveal delay={0.25} className="mb-8">
          <div className="flex flex-row gap-3.5 overflow-x-auto snap-x snap-mandatory pb-3 px-1 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {funnelSteps.map((step) => {
              const isActive = step.id === activeTabId;
              const IconComponent = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveTabId(step.id)}
                  className={`text-left rounded-xl py-2.5 px-4 sm:py-3 sm:px-4.5 transition-all duration-300 relative shrink-0 w-[78vw] sm:w-[300px] lg:w-[320px] snap-start border flex items-center gap-3.5 ${
                    isActive
                      ? "border-[#1a5147] bg-card text-foreground shadow-sm"
                      : "border-border/80 bg-card hover:bg-muted/30 text-foreground hover:border-[#1a5147]/40 shadow-none"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? "bg-[#1a5147] text-white"
                        : "bg-[#1a5147]/10 text-[#1a5147]"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <h3
                      className={`text-sm sm:text-base font-bold tracking-tight truncate ${
                        isActive ? "text-[#1a5147]" : "text-foreground"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-xs leading-snug line-clamp-2 mt-0.5 text-muted-foreground font-normal">
                      {step.shortSubtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Swipe hint - nur auf mobilen Geräten anzeigen */}
          <div className="flex md:hidden items-center gap-2 text-xs font-medium text-muted-foreground mt-2.5">
            <motion.svg
              animate={{ x: [0, 5, 0] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-4 h-4 shrink-0 text-[#1a5147]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </motion.svg>
            <span>Wische nach rechts, um weitere Schritte zu sehen</span>
          </div>
        </Reveal>

        {/* Big Main Card below */}
        <Reveal delay={0.3} className="w-full">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Text Content Column */}
                <div className="lg:col-span-6 flex flex-col order-2 lg:order-1">
                  <div>
                    {/* Badge / Tag — nur Desktop */}
                    <div className="hidden lg:inline-flex items-center rounded-full bg-[#1a5147]/10 px-3 py-1 text-xs font-semibold text-[#1a5147] mb-4">
                      {activeStep.title}
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {activeStep.description}
                    </p>
                  </div>
                </div>

                {/* GIF Column */}
                <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
                  <img
                    src={activeStep.gifUrl}
                    alt={`${activeStep.title} Vorschau GIF`}
                    className="w-full h-auto object-contain object-center rounded-lg"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AdsFunnelSection;
