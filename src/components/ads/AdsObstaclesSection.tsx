import Reveal from "@/components/Reveal";
import { Footprints, Megaphone, Radar } from "lucide-react";
import React from "react";

interface Obstacle {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

const obstacles: Obstacle[] = [
  {
    icon: Footprints,
    title: "Du musst ständig neue Leute ansprechen",
    description:
      "Um Verträge zu schreiben, musst du laufend neue Menschen ansprechen – auf dem Feld, über dein Netzwerk oder durch Empfehlungen.",
  },
  {
    icon: Megaphone,
    title: "Du bekommst viel Ablehnung",
    description:
      "Der Kontakt geht von dir aus. Viele wollen sich gerade gar nicht mit ihrem Tarif beschäftigen – deshalb musst du Interesse erst wecken und bekommst entsprechend viel Ablehnung.",
  },
  {
    icon: Radar,
    title: "Mehr Verträge bedeuten mehr Vertriebsarbeit",
    description:
      "Willst du mehr Verträge schreiben, brauchst du meist mehr Zeit auf dem Feld, mehr Gespräche oder zusätzliche Mitarbeiter.",
  },
];

const AdsObstaclesSection = () => {
  return (
    <section className="relative bg-background px-6 py-20 md:py-28">
      <div className="mx-auto max-w-7xl">
        {/* Headline */}
        <Reveal className="flex justify-center">
          <h2 className="max-w-3xl text-center text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Kommt dir das im Vertrieb bekannt vor?
          </h2>
        </Reveal>

        {/* Desktop View: 3 Spalten Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5 mt-14 items-stretch">
          {obstacles.map((obstacle, index) => {
            const IconComponent = obstacle.icon;
            return (
              <Reveal
                key={obstacle.title}
                delay={index * 0.06}
                className="h-full"
              >
                <div className="h-full rounded-2xl border border-border/70 bg-card p-6 md:p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-md flex flex-col justify-start">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                    <IconComponent className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug mb-3">
                    {obstacle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {obstacle.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Mobile View: Sticky Stacking Cards */}
        <div className="md:hidden mt-10 relative flex flex-col gap-6 pb-4">
          {obstacles.map((obstacle, index) => {
            const IconComponent = obstacle.icon;
            return (
              <div
                key={obstacle.title}
                className="sticky transition-all duration-300"
                style={{
                  top: `calc(80px + ${index * 20}px)`,
                  zIndex: index + 1,
                }}
              >
                <Reveal delay={index * 0.05}>
                  <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-lg">
                    <div className="mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <IconComponent className="h-5 w-5" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-snug mb-2.5">
                      {obstacle.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {obstacle.description}
                    </p>
                  </div>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AdsObstaclesSection;
