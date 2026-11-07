import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import { AlertTriangle, Filter, Puzzle } from "lucide-react";

interface TabItem {
  id: string;
  tag: string;
  label: string;
  icon: typeof AlertTriangle;
  headline: string;
  description: string;
}

const tabs: TabItem[] = [
  {
    id: "irrglaube",
    tag: "DER IRRGLAUBE",
    label: "Der Irrglaube",
    icon: AlertTriangle,
    headline: "„Für mehr Verträge muss ich einfach mehr Akquise machen.“",
    description:
      "Mehr klingeln, mehr Menschen anschreiben und aktiver nach Empfehlungen fragen klingt zunächst nach der logischen Lösung.",
  },
  {
    id: "sackgasse",
    tag: "DIE SACKGASSE",
    label: "Die Sackgasse",
    icon: Filter,
    headline: "Mehr Akquise bedeutet vor allem mehr persönlichen Aufwand.",
    description:
      "Solange jeder neue Interessent erst durch deine eigene Aktivität entstehen muss, wächst dein Vertrieb nur so stark wie dein persönlicher Einsatz.",
  },
  {
    id: "wahrheit",
    tag: "DIE WAHRHEIT",
    label: "Die Wahrheit",
    icon: Puzzle,
    headline: "Dir fehlt eine eigene, planbare Leadquelle.",
    description:
      "Du brauchst einen Weg, der unabhängig von deiner täglichen Kaltakquise kontinuierlich neue Anfragen von Menschen erzeugt, die ihren Tarif tatsächlich prüfen möchten.",
  },
];

const AdsTabProblemSection = () => {
  const [activeTabId, setActiveTabId] = useState<string>("irrglaube");
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const IconComponent = activeTab.icon;

  return (
    <section className="relative bg-background px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Section Headline */}
        <Reveal className="flex justify-center">
          <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Warum mehr Akquise allein das Problem nicht löst
          </h2>
        </Reveal>

        {/* 3 Clickable Circle Indicator Tabs */}
        <Reveal delay={0.1} className="mt-12 sm:mt-16 flex justify-center">
          <div className="flex items-center justify-center gap-8 sm:gap-14">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTabId(tab.id)}
                  className="group flex flex-col items-center gap-2.5 focus:outline-none transition-all"
                >
                  {/* Circle indicator */}
                  <div
                    className={`relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-[#1a5147] shadow-sm scale-110"
                        : "bg-muted/70 hover:bg-muted"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabRing"
                        className="absolute inset-0 rounded-full ring-2 ring-[#1a5147]/30 ring-offset-2 ring-offset-background"
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </div>

                  {/* Label below circle */}
                  <span
                    className={`text-xs sm:text-sm tracking-tight transition-colors duration-200 ${
                      isActive
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Content Card below */}
        <div className="mt-10 sm:mt-12 flex justify-center">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeInOut" }}
                className="relative rounded-3xl border border-border/80 bg-card p-7 sm:p-10 shadow-sm"
              >
                {/* Icon square */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a5147]/10 text-[#1a5147]">
                  <IconComponent className="h-7 w-7" strokeWidth={2} />
                </div>

                {/* Eyebrow Tag */}
                <span className="inline-block text-[11px] font-bold tracking-widest text-[#1a5147] uppercase mb-3">
                  {activeTab.tag}
                </span>

                {/* Headline */}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-snug mb-4">
                  {activeTab.headline}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {activeTab.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* CTA Button */}
        <Reveal delay={0.15} className="mt-10 sm:mt-14 flex justify-center">
          <CTAButton text="Kostenlose Demo buchen" />
        </Reveal>
      </div>
    </section>
  );
};

export default AdsTabProblemSection;
