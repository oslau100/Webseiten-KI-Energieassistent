import { relaunchAssets } from "@/lib/relaunchAssets";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import { Users2, Mail } from "lucide-react";

interface AdditionalChannel {
  id: string;
  tabLabel: string;
  badge: string;
  heading: string;
  description: string;
  gifUrl?: string;
}

const NEW_GIF_URL =
  relaunchAssets.partner;

const channels: AdditionalChannel[] = [
  {
    id: "partnerprogramm",
    tabLabel: "Partnerprogramm",
    badge: "Partnerprogramm",
    heading: "Neue Leads über Partner",
    description:
      "Du erhältst ein automatisiertes Partnerprogramm, mit dem du Online- und Offline-Partner wie Influencer, Onlineshops, Makler oder Hausverwaltungen als zusätzliche Leadquelle gewinnen kannst. Jeder Partner bekommt einen persönlichen Link oder QR-Code und einen eigenen Login, in dem Empfehlungen und erfolgreiche Abschlüsse automatisch getrackt werden. Sobald ein vermittelter Vertrag provisioniert wurde, wird die von dir festgelegte Vergütung fällig.",
    gifUrl: NEW_GIF_URL,
  },
  {
    id: "einwurfkarten",
    tabLabel: "Einwurfkarten",
    badge: "Einwurfkarten",
    heading: "Lokale Leads über Einwurfkarten",
    description:
      "Du erhältst individuell gestaltete und druckfertige Einwurfkarten für deine gewünschten Gebiete. Stadt, Branding und Ansprache werden passend für dich vorbereitet. Über den QR-Code gelangen Haushalte direkt in die Tarifprüfung deines Energieassistenten, erhalten automatisch ihr persönliches Ergebnis und werden als qualifizierte Leads in dein System übernommen. Du kümmerst dich nur noch um die Verteilung.",
  },
];

const AdsAdditionalChannelsSection = () => {
  const [activeTabId, setActiveTabId] = useState<string>("partnerprogramm");
  const activeChannel =
    channels.find((c) => c.id === activeTabId) || channels[0];

  return (
    <section className="relative bg-background px-6 py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header — Centered */}
        <div className="mb-10 sm:mb-14 flex flex-col items-center text-center">
          <Reveal className="flex justify-center">
            <p className="mb-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary">
              WEITERE FEATURES
            </p>
          </Reveal>

          <Reveal delay={0.1} className="flex justify-center">
            <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              Noch mehr Wege zu neuen Leads
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 flex justify-center">
            <p className="max-w-3xl text-center text-lg text-muted-foreground leading-relaxed">
              Neben Meta- und Google-Kampagnen erhältst du weitere
              Möglichkeiten, neue Interessenten direkt in die Tarifprüfung
              deines Energieassistenten zu bringen.
            </p>
          </Reveal>
        </div>

        {/* Pill Toggle Switch — schlank, dezent & clean */}
        <Reveal delay={0.25} className="flex justify-center mb-8 sm:mb-10">
          <div className="inline-flex items-center p-1 rounded-full border border-border/70 bg-card shadow-sm">
            {channels.map((channel) => {
              const isActive = channel.id === activeTabId;
              return (
                <button
                  key={channel.id}
                  type="button"
                  onClick={() => setActiveTabId(channel.id)}
                  className={`relative px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold tracking-tight transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeChannelPill"
                      className="absolute inset-0 rounded-full bg-[#1a5147] shadow-sm"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 32,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                    {channel.id === "partnerprogramm" ? (
                      <Users2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    {channel.tabLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Card Container — Exakt wie Layout der Hauptseite */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChannel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                {/* Text Content Column */}
                <div
                  className={`flex flex-col order-2 lg:order-1 ${activeChannel.id === "einwurfkarten" ? "lg:col-span-12" : "lg:col-span-6"}`}
                >
                  <div>
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-4">
                      {activeChannel.heading}
                    </h3>

                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {activeChannel.description}
                    </p>
                  </div>
                </div>

                {/* Visual Column — nur für Partnerprogramm */}
                {activeChannel.id === "partnerprogramm" && (
                  <div className="lg:col-span-6 flex items-center justify-center order-1 lg:order-2">
                    <div className="w-full overflow-hidden rounded-xl border border-border/70 bg-card p-2 shadow-sm flex items-center justify-center">
                      <img
                        src={activeChannel.gifUrl}
                        alt={`${activeChannel.badge} Vorschau`}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CTA Button */}
        <div className="mt-12 flex justify-center">
          <CTAButton text="Kostenlose Demo buchen" />
        </div>
      </div>
    </section>
  );
};

export default AdsAdditionalChannelsSection;
