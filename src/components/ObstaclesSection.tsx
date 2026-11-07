import Reveal from "@/components/Reveal";
import CTAButton from "@/components/CTAButton";

const obstacles = [
  {
    number: "I",
    title: "Zu wenig Orientierung",
    description:
      "Viele wissen nicht, ob sie überhaupt sparen können und worauf es bei einem guten Tarif ankommt.",
  },
  {
    number: "II",
    title: "Zu viel Komplexität",
    description:
      "Preise, Boni, Bedingungen und zahlreiche Angebote müssen selbst verglichen werden.",
  },
  {
    number: "III",
    title: "Zu viel Unsicherheit",
    description:
      "Welcher Anbieter ist zuverlässig – und wo können versteckte Nachteile liegen?",
  },
  {
    number: "IV",
    title: "Zu viel Aufwand",
    description:
      "Unterlagen suchen, Daten zusammentragen und den gesamten Prozess selbst organisieren.",
  },
];

const ObstaclesSection = () => {
  return (
    <section
      id="das-geschaeftsmodell"
      className="relative bg-background px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Headline */}
        <Reveal>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Warum viele Haushalte trotz möglicher Ersparnis nicht handeln
          </h2>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={0.1} className="mt-6">
          <p className="max-w-3xl text-lg text-muted-foreground leading-relaxed">
            Vergleichen, verstehen, einschätzen und wechseln: Für viele
            Haushalte ist der Weg zum passenden Tarif noch immer unnötig
            kompliziert.
          </p>
        </Reveal>

        {/* Desktop View: 4 Compact Cards side-by-side (Grid) */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-5 mt-12 items-stretch">
          {obstacles.map((obstacle, index) => (
            <Reveal
              key={obstacle.number}
              delay={index * 0.08}
              className="h-full"
            >
              <div className="h-full rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:border-primary hover:shadow-md">
                <span className="block text-xs font-bold text-primary mb-2.5">
                  {obstacle.number}
                </span>
                <h3 className="text-base font-bold text-foreground tracking-tight leading-snug mb-2.5">
                  {obstacle.title}
                </h3>
                <p className="text-xs md:text-[13px] text-muted-foreground leading-relaxed">
                  {obstacle.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile View: Sticky Stacking Cards */}
        <div className="lg:hidden mt-10 relative flex flex-col gap-4 pb-6">
          {obstacles.map((obstacle, index) => (
            <div
              key={obstacle.number}
              className="sticky transition-all duration-300"
              style={{
                top: `calc(80px + ${index * 18}px)`,
                zIndex: index + 1,
              }}
            >
              <Reveal delay={index * 0.05}>
                <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-md backdrop-blur-md bg-card/98">
                  <span className="block text-xs font-bold text-primary mb-2">
                    {obstacle.number}
                  </span>
                  <h3 className="text-base font-bold text-foreground tracking-tight mb-2">
                    {obstacle.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {obstacle.description}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <Reveal delay={0.3} className="mt-12">
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">
              29 % empfinden einen Energievertragswechsel als aufwändig.
            </span>{" "}
            <span className="text-muted-foreground/70">
              Quelle: verbraucherzentrale bundesverband / forsa · 2026
            </span>
          </p>
        </Reveal>

        {/* CTA */}
        <CTAButton className="mt-10 flex justify-center" />
      </div>
    </section>
  );
};

export default ObstaclesSection;
