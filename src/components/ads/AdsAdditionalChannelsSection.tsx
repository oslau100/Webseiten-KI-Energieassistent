import { relaunchAssets } from "@/lib/relaunchAssets";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";
import { Users2, Mail, Megaphone } from "lucide-react";

type ChannelId = "ads-system" | "einwurfkarten" | "partnerprogramm";

interface AcquisitionChannel {
  id: ChannelId;
  tabLabel: string;
  summary: string;
  heading: string;
  paragraphs: readonly string[];
  gifUrl: string;
  alt: string;
}

const channels: AcquisitionChannel[] = [
  {
    id: "ads-system",
    tabLabel: "Ads-System",
    summary: "Fertige Anzeigen mit wenigen Klicks starten.",
    heading: "Neue Leads mit fertigen Ads",
    paragraphs: [
      "Für Strom und Gas stehen dir fertige, erprobte Ads inklusive Bildern, Videos und Kampagneneinstellungen zur Verfügung. Die Kampagnen sind darauf ausgerichtet, Menschen zu erreichen, die sich bereits für einen Tarifwechsel interessieren.",
      "Du wählst eine Anzeige aus der Bibliothek, legst dein Budget fest und startest deine Kampagne mit wenigen Klicks – ohne selbst Anzeigen erstellen oder Kampagnen einrichten zu müssen.",
    ],
    gifUrl: relaunchAssets.acquisition.adsSequence,
    alt: "Ads-System: Anzeigenbibliothek, Budget und Kampagnenstart nacheinander animiert",
  },
  {
    id: "einwurfkarten",
    tabLabel: "Einwurfkarten",
    summary: "Mit druckfertigen QR-Karten Haushalte erreichen.",
    heading: "Neue Leads mit Einwurfkarten",
    paragraphs: [
      "Du erhältst individuell gestaltete, druckfertige Einwurfkarten für deine gewünschten Gebiete. Stadtbezug, Branding und Ansprache sind bereits auf dich abgestimmt und der persönliche QR-Code ist integriert.",
      "Nach dem Druck musst du die Karten nur noch einwerfen. Interessierte Haushalte scannen den QR-Code und starten ihre Tarifprüfung selbstständig – ohne dass du persönlich klingeln oder ein Verkaufsgespräch führen musst.",
    ],
    gifUrl: relaunchAssets.acquisition.flyer,
    alt: "Animierte Einwurfkarte mit individuellem Branding, Tarifprüfung und QR-Code",
  },
  {
    id: "partnerprogramm",
    tabLabel: "Partnerprogramm",
    summary: "Empfehlungen automatisch erfassen und zuordnen.",
    heading: "Neue Leads über Partner",
    paragraphs: [
      "Mit deinem automatisierten Partnerprogramm kannst du Influencer, Onlineshops, Makler, Hausverwaltungen, Lokale Geschäfte etc. als zusätzliche Leadquellen gewinnen.",
      "Jeder Partner erhält einen persönlichen Empfehlungslink oder QR-Code und einen eigenen Login. Empfehlungen und erfolgreiche Abschlüsse werden automatisch erfasst und zugeordnet. Die von dir festgelegte Vergütung wird erst fällig, sobald ein vermittelter Vertrag provisioniert wurde.",
    ],
    gifUrl: relaunchAssets.partner,
    alt: "Partnerprogramm: Anmeldung und Empfehlungssystem als Animation",
  },
];

const icons = { "ads-system": Megaphone, einwurfkarten: Mail, partnerprogramm: Users2 } as const;

const AdsAdditionalChannelsSection = () => {
  const [activeTabId, setActiveTabId] = useState<ChannelId>("ads-system");
  const activeChannel = channels.find((channel) => channel.id === activeTabId) ?? channels[0];

  return (
    <section id="akquise-tools" className="relative bg-background px-6 py-20 md:py-28 overflow-hidden scroll-mt-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 sm:mb-14 flex flex-col items-center text-center">
          <Reveal className="flex justify-center">
            <p className="mb-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary">
              AKQUISE-TOOLS
            </p>
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center">
            <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              So generierst du eigene Leads mit deinem Energieassistenten
            </h2>
          </Reveal>
          <Reveal delay={0.2} className="mt-6 flex justify-center">
            <p className="max-w-3xl text-center text-lg text-muted-foreground leading-relaxed">
              Mit erprobten Ads, druckfertigen Einwurfkarten und einem automatisierten Partnerprogramm hast du
              die passenden Tools für eine einfache und effektive Leadgewinnung.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.25} className="mb-8 sm:mb-10">
          <div role="tablist" aria-label="Akquise-Tools" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {channels.map((channel) => {
              const selected = channel.id === activeTabId;
              const Icon = icons[channel.id];
              return (
                <button
                  key={channel.id}
                  type="button"
                  id={`akquise-tab-${channel.id}`}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="akquise-tabpanel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTabId(channel.id)}
                  onKeyDown={(event) => {
                    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    const index = channels.findIndex((item) => item.id === channel.id);
                    const next = event.key === "Home" ? 0 : event.key === "End" ? channels.length - 1
                      : (index + (event.key === "ArrowRight" ? 1 : -1) + channels.length) % channels.length;
                    setActiveTabId(channels[next].id);
                    document.getElementById(`akquise-tab-${channels[next].id}`)?.focus();
                  }}
                  className={`rounded-2xl border p-4 sm:p-5 text-left transition-all duration-200 shadow-sm ${selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary text-foreground"
                    : "border-border/70 bg-card text-foreground hover:border-primary/40"}`}
                >
                  <div className="flex items-center gap-2 font-semibold text-base mb-2">
                    <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
                    {channel.tabLabel}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{channel.summary}</p>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeChannel.id}
              id="akquise-tabpanel"
              role="tabpanel"
              aria-labelledby={`akquise-tab-${activeChannel.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-sm"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[360px] lg:min-h-[470px]">
                <div className="lg:col-span-6 flex flex-col justify-center order-1">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-4">
                    {activeChannel.heading}
                  </h3>
                  {activeChannel.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
                <div className="lg:col-span-6 flex items-center justify-center order-2 min-w-0">
                  <div className="w-full max-w-md overflow-hidden rounded-xl border border-border/70 bg-card p-2 shadow-sm flex justify-center items-center">
                    <img
                      src={activeChannel.gifUrl}
                      alt={activeChannel.alt}
                      className={`w-full max-h-[510px] h-auto object-contain rounded-lg ${activeChannel.id === "einwurfkarten" ? "motion-reduce:hidden" : ""}`}
                      loading="lazy"
                    />
                    {activeChannel.id === "einwurfkarten" && (
                      <img
                        src={relaunchAssets.acquisition.flyerOriginal}
                        alt="Einwurfkarten-Motiv ohne Animation"
                        className="hidden motion-reduce:block w-full max-h-[510px] h-auto object-contain rounded-lg"
                        loading="lazy"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-12 flex justify-center">
          <CTAButton text="Kostenlose Demo buchen" />
        </div>
      </div>
    </section>
  );
};

export default AdsAdditionalChannelsSection;
