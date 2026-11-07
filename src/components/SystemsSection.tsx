import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Video,
  Megaphone,
  Share2,
  Users,
  LucideIcon,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

interface SystemTab {
  id: string;
  title: string;
  shortSubtitle: string;
  description: string;
  bulletPoints: string[];
  gifUrl: string;
  icon: LucideIcon;
}

const systems: SystemTab[] = [
  {
    id: "content",
    title: "Content-System",
    shortSubtitle: "Erstelle Inhalte, die neue Nutzer erreichen.",
    description:
      "Mit der KI-gestützten Content-Erstellung entstehen in wenigen Klicks fertige Skripte für Kurzvideos, die gezielt neue Nutzer auf deinen Energieassistenten aufmerksam machen.",
    bulletPoints: [
      "Virale Kurzvideo-Skripte erstellen",
      "Auch faceless Videos möglich",
      "Videos schneiden und für Social Media aufbereiten",
    ],
    gifUrl:
      "https://vibe.filesafe.space/1789758049296638029/attachments/06fa7f71-f572-4a8f-868a-24b04da1ae0b.gif",
    icon: Video,
  },
  {
    id: "ads",
    title: "Ads-System",
    shortSubtitle: "Schalte bewährte Werbung mit wenigen Klicks.",
    description:
      "Greife auf eine laufend aktualisierte Bibliothek mit bewährten Werbeanzeigen zurück. Wähle ein Creative, lege dein Budget fest und schalte die Anzeige direkt über das System.",
    bulletPoints: [
      "Bilder, Grafiken & Videos zur Auswahl",
      "Laufend aktualisierte Creatives",
      "Mit wenigen Klicks auf Meta & Google schalten",
    ],
    gifUrl:
      "https://vibe.filesafe.space/1789758049296638029/attachments/06fa7f71-f572-4a8f-868a-24b04da1ae0b.gif",
    icon: Megaphone,
  },
  {
    id: "referral",
    title: "Empfehlungssystem",
    shortSubtitle: "Gewinne neue Nutzer über Empfehlungen.",
    description:
      "Bestehende Nutzer können deinen Energieassistenten mit einem persönlichen Link weiterempfehlen. Das System erfasst automatisch, wem ein Nutzer zugeordnet ist und ermöglicht eine individuelle Belohnung.",
    bulletPoints: [
      "Persönliche Empfehlungslinks",
      "Automatisches Tracking",
      "Belohnungen per Gutschein oder Geld",
    ],
    gifUrl:
      "https://vibe.filesafe.space/1789758049296638029/attachments/06fa7f71-f572-4a8f-868a-24b04da1ae0b.gif",
    icon: Share2,
  },
  {
    id: "crm",
    title: "CRM-System",
    shortSubtitle:
      "Behalte Nutzer, Chancen und Abschlüsse an einem Ort im Blick.",
    description:
      "Alle Nutzer und Tarifprüfungen laufen zentral in deinem CRM zusammen. Du erkennst, wo ein Nutzer gerade steht, welche Chancen noch offen sind und wen du gezielt weiter betreuen kannst.",
    bulletPoints: [
      "Zentrale Übersicht aller Nutzer & Anfragen",
      "Automatisches Status- & Phasen-Tracking",
      "Offene Chancen & Nachfassen im Blick",
    ],
    gifUrl:
      "https://vibe.filesafe.space/1789758049296638029/attachments/06fa7f71-f572-4a8f-868a-24b04da1ae0b.gif",
    icon: Users,
  },
];

const SystemsSection = () => {
  const [activeTabId, setActiveTabId] = useState<string>("content");
  const activeSystem =
    systems.find((sys) => sys.id === activeTabId) || systems[0];

  return (
    <section
      id="systeme"
      className="relative bg-background px-6 py-20 md:py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Reveal className="mb-6">
            <span className="inline-block border-b border-dotted border-border pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Systeme für Skalierung
            </span>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              So entstehen die Ergebnisse unserer Partner
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="mt-6">
            <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
              Dahinter stehen digitale Systeme, die im Hintergrund wichtige
              Prozesse übernehmen, die Nutzergewinnung vereinfachen und das
              Geschäftsmodell skalierbar machen.
            </p>
          </Reveal>
        </div>

        {/* Horizontal System Tabs (horizontal scroll on all viewports) */}
        <Reveal delay={0.25} className="mb-8">
          <div className="flex flex-row gap-3.5 overflow-x-auto snap-x snap-mandatory pb-3 px-1 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {systems.map((system) => {
              const isActive = system.id === activeTabId;
              const IconComponent = system.icon;

              return (
                <button
                  key={system.id}
                  onClick={() => setActiveTabId(system.id)}
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
                      {system.title}
                    </h3>
                    <p className="text-xs leading-snug line-clamp-2 mt-0.5 text-muted-foreground font-normal">
                      {system.shortSubtitle}
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
            <span>Wische nach rechts, um weitere Systeme zu sehen</span>
          </div>
        </Reveal>

        {/* Big Main Card below */}
        <Reveal delay={0.3} className="w-full">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSystem.id}
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
                      {activeSystem.title}
                    </div>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {activeSystem.description}
                    </p>

                    {/* Bullet points */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-6">
                      {activeSystem.bulletPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-xs sm:text-sm text-foreground font-medium"
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1a5147]/15 text-[#1a5147] mt-0.5">
                            <Check className="h-3 w-3 stroke-[2.5]" />
                          </span>
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* GIF Column */}
                <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
                  <img
                    src={activeSystem.gifUrl}
                    alt={`${activeSystem.title} Vorschau GIF`}
                    className="w-full h-auto object-contain object-center rounded-lg"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>

        {/* CTA */}
        <CTAButton className="mt-10 flex justify-center" />
      </div>
    </section>
  );
};

export default SystemsSection;
