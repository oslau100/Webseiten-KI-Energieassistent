import { motion } from "framer-motion";
import { Check, User, Phone, Mail, HelpCircle } from "lucide-react";
import Reveal from "@/components/Reveal";

const normalLeadItems = [
  { icon: User, label: "Name" },
  { icon: Phone, label: "Telefonnummer" },
  { icon: Mail, label: "E-Mail-Adresse" },
  { icon: HelpCircle, label: "Interesse noch unklar" },
];

const qualifiedLeadItems = [
  "Kontaktdaten liegen vor",
  "Konkretes Interesse bereits gezeigt",
  "Tarif bereits geprüft",
  "Persönliche Empfehlung liegt vor",
  "Mögliche Ersparnis bekannt",
  "Tarif- und Verbrauchsdaten erfasst",
  "Beratung zur Empfehlung bereits erhalten",
];

const AdsLeadQualitySection = () => {
  return (
    <section className="relative bg-background px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Header — centered */}
        <div className="mb-12 flex flex-col items-center">
          <Reveal delay={0.1} className="flex justify-center">
            <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              Qualifizierte Leads statt reiner Kontaktdaten
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="mt-6 flex justify-center">
            <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed">
              Dein Energieassistent liefert dir mehr als reine Kontaktdaten. Schon vor einem möglichen Gespräch
              erhältst du wertvolle Informationen über deine Interessenten und musst bei der weiteren Beratung
              nicht mehr bei null anfangen.
            </p>
          </Reveal>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-stretch">
          {/* Left: Normal Lead (muted) */}
          <Reveal delay={0.25}>
            <div className="h-full rounded-2xl border border-border/60 bg-muted/20 p-7 sm:p-8 md:p-10 opacity-70">
              <span className="inline-block text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-5">
                Klassischer Lead
              </span>

              <div className="flex flex-col gap-4">
                {normalLeadItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 text-muted-foreground"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60">
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  );
                })}

                <div className="flex items-center gap-3 text-muted-foreground/50 pt-1">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/30">
                    <span className="text-xs">?</span>
                  </div>
                  <span className="text-sm font-medium italic">
                    …und sonst nichts
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: Your Lead (highlighted) */}
          <Reveal delay={0.35}>
            <div className="relative h-full rounded-2xl border border-[#1a5147] bg-card p-7 sm:p-8 md:p-10 shadow-md">
              {/* Subtle glow */}
              <div className="pointer-events-none absolute -top-8 right-8 h-24 w-24 rounded-full bg-[#1a5147]/10 blur-2xl" />

              <span className="relative inline-block text-[11px] font-bold tracking-widest text-[#1a5147] uppercase mb-5">
                Dein qualifizierter Lead
              </span>

              <div className="relative flex flex-col gap-4">
                {qualifiedLeadItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a5147] text-white">
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-foreground">
                      {item}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* CTA — ads page style */}
        <Reveal delay={0.4} className="mt-12 flex justify-center">
          <a
            href="https://calendly.com/energieassistent-demo/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-center text-base font-medium text-primary-foreground shadow-lg transition-all hover:shadow-xl"
          >
            Kostenlose Demo buchen
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export default AdsLeadQualitySection;
