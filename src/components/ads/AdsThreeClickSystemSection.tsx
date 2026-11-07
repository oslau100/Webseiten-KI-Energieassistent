import { relaunchAssets } from "@/lib/relaunchAssets";
import Reveal from "@/components/Reveal";
import { MousePointerClick, Sliders, Rocket } from "lucide-react";

interface StepItem {
  number: string;
  stepLabel: string;
  icon: React.ElementType;
  title: string;
  description: string;
  image: string;
  alt: string;
}

const steps: StepItem[] = [
  {
    number: "01",
    stepLabel: "Schritt 1",
    icon: MousePointerClick,
    title: "Anzeige auswählen",
    description: "Wähle eine bewährte Anzeige aus unserer Bibliothek.",
    image:
      relaunchAssets.ads.library,
    alt: "Schritt 1: Anzeige aus Bibliothek auswählen",
  },
  {
    number: "02",
    stepLabel: "Schritt 2",
    icon: Sliders,
    title: "Budget festlegen",
    description: "Lege fest, mit welchem Budget deine Kampagne starten soll.",
    image:
      relaunchAssets.ads.settings,
    alt: "Schritt 2: Kampagnen-Budget und Einstellungen festlegen",
  },
  {
    number: "03",
    stepLabel: "Schritt 3",
    icon: Rocket,
    title: "Kampagne starten",
    description:
      "Schalte deine eigene Kampagne live und generiere darüber automatisiert neue Leads.",
    image:
      relaunchAssets.ads.connect,
    alt: "Schritt 3: Werbekonten verbinden und Kampagne starten",
  },
];

const AdsThreeClickSystemSection = () => {
  return (
    <section
      id="ads-system"
      className="relative bg-background px-6 py-20 md:py-28 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Eyebrow */}
        <Reveal className="flex justify-center">
          <p className="mb-4 text-xs sm:text-sm font-semibold tracking-wider uppercase text-primary">
            DIE LÖSUNG
          </p>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1} className="flex justify-center">
          <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Gewinne automatisiert Leads zu niedrigen Kosten
          </h2>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={0.2} className="mt-6 flex justify-center">
          <p className="max-w-2xl text-center text-lg text-muted-foreground leading-relaxed">
            Statt ständig selbst neue Leute finden und ansprechen zu müssen,
            kommen über deine Kampagne Interessenten zu dir, die ihren Tarif
            gerade prüfen möchten. Anzeigen und Kampagneneinstellungen sind im
            System vorbereitet – du startest deine Kampagne in drei einfachen
            Schritten.
          </p>
        </Reveal>

        {/* 3 Step Cards Layout */}
        <div className="mt-14 md:mt-18 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Reveal
                key={step.number}
                delay={0.15 + index * 0.12}
                className="h-full"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-lg">
                  {/* Visual Screenshot - no background */}
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-full rounded-lg object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />

                  {/* Step Header */}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <IconComponent className="h-3.5 w-3.5" />
                      {step.stepLabel}
                    </span>
                    <span className="text-xl font-black text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                      {step.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-3 text-lg font-bold tracking-tight text-foreground leading-snug">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdsThreeClickSystemSection;
