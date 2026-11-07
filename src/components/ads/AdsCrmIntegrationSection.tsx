import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

const AdsCrmIntegrationSection = () => {
  return (
    <section className="relative bg-background px-6 py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Header — centered */}
        <div className="mb-12 flex flex-col items-center text-center">
          {/* Eyebrow — same styling as previous sections */}
          <Reveal>
            <div className="mb-4">
              <span className="text-xs sm:text-sm font-semibold tracking-wider text-primary uppercase">
                CRM-SYSTEM
              </span>
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={0.1} className="flex justify-center">
            <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
              Behalte jeden Lead im Blick
            </h2>
          </Reveal>

          {/* Description */}
          <Reveal delay={0.2} className="mt-6 flex justify-center">
            <p className="max-w-3xl text-center text-lg text-muted-foreground leading-relaxed">
              Leads aus Ads, Partnerprogramm und Einwurfkarten landen
              automatisch mit Kontaktdaten, relevanten Tarifdetails und
              aktuellem Status in deinem CRM. So kannst du neue Leads direkt
              bearbeiten und siehst jederzeit, welche noch offen sind und was
              als Nächstes zu tun ist.
            </p>
          </Reveal>
        </div>

        {/* Dashboard Mockup / Image Showcase */}
        <Reveal delay={0.3} className="w-full">
          <div className="relative mx-auto w-full max-w-xl md:max-w-2xl">
            {/* Subtle background glow */}
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent opacity-60 blur-2xl" />

            {/* Dashboard Container */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all duration-300 hover:border-primary/40">
              {/* Browser/app bar — subtle & elegant */}
              <div className="flex items-center justify-between border-b border-border/40 bg-muted/20 px-3 py-2 md:px-4 md:py-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-foreground/20 md:h-3 md:w-3" />
                  <span className="h-2 w-2 rounded-full bg-foreground/20 md:h-3 md:w-3" />
                  <span className="h-2 w-2 rounded-full bg-foreground/20 md:h-3 md:w-3" />
                </div>
                <div className="truncate rounded-md bg-background/60 px-2 py-0.5 text-[9px] md:text-[11px] font-medium text-muted-foreground/80 md:border md:border-border/30">
                  energieassistent.io/dashboard
                </div>
                <div className="w-8 md:w-12" />
              </div>

              {/* CRM GIF Showcase */}
              <img
                src={relaunchAssets.crm}
                alt="Energieassistent.io CRM & Aktivitäten Übersicht"
                className="w-full h-auto object-cover object-top"
                loading="lazy"
              />
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <CTAButton
          text="Kostenlose Demo buchen"
          className="mt-12 flex justify-center"
          delay={0.35}
        />
      </div>
    </section>
  );
};

export default AdsCrmIntegrationSection;
