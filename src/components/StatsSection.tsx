import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const AnimatedCounter = ({
  end,
  duration = 1800,
  suffix = "",
  prefix = "",
  className = "",
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut =
              progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [end, duration]);

  return (
    <span ref={elementRef} className={className}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  return (
    <section
      id="die-chance"
      className="relative bg-background px-6 py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        {/* Eyebrow */}
        <Reveal className="mb-6">
          <span className="inline-block border-b border-dotted border-border pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Deine Chance im Milliardenmarkt Energie
          </span>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.1}>
          <h2 className="max-w-3xl text-4xl md:text-5xl font-normal tracking-tight leading-tight text-foreground">
            Millionen Haushalte. Hunderte Euro Sparpotenzial.
          </h2>
        </Reveal>

        {/* Subheadline */}
        <Reveal delay={0.2} className="mt-6">
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Millionen Haushalte nutzen bestehende Sparmöglichkeiten bei Strom
            und Gas noch nicht – obwohl der finanzielle Unterschied erheblich
            sein kann.
          </p>
        </Reveal>

        {/* Desktop View: 2 Cards side-by-side */}
        <div className="hidden md:mt-14 md:grid md:grid-cols-2 gap-6">
          {/* Dark card */}
          <Reveal delay={0.15}>
            <div className="flex h-full flex-col justify-between rounded-2xl bg-primary p-8 md:p-10 min-h-[280px]">
              <div>
                <AnimatedCounter
                  end={18}
                  suffix=" Mio.+"
                  className="block text-6xl md:text-7xl font-normal tracking-tight text-primary-foreground"
                />
                <p className="mt-6 max-w-xs text-lg font-semibold text-primary-foreground leading-snug">
                  Haushalte kennen grundlegende Unterschiede bei Energietarifen
                  nicht.
                </p>
              </div>
              <p className="mt-10 text-xs text-primary-foreground/60">
                Quelle: verbraucherzentrale bundesverband / forsa · 2026
              </p>
            </div>
          </Reveal>

          {/* Light card */}
          <Reveal delay={0.3}>
            <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-8 md:p-10 min-h-[280px]">
              <div>
                <h3 className="text-xl font-semibold text-foreground">
                  Hunderte Euro Sparpotenzial
                </h3>

                <div className="mt-6 flex items-stretch gap-6">
                  <div>
                    <AnimatedCounter
                      end={413}
                      suffix=" €"
                      className="block text-4xl md:text-5xl font-normal tracking-tight text-foreground"
                    />
                    <span className="mt-2 block text-sm text-muted-foreground">
                      Strom / Jahr
                    </span>
                  </div>
                  <span className="w-px bg-border" aria-hidden="true" />
                  <div>
                    <AnimatedCounter
                      end={878}
                      suffix=" €"
                      className="block text-4xl md:text-5xl font-normal tracking-tight text-foreground"
                    />
                    <span className="mt-2 block text-sm text-muted-foreground">
                      Gas / Jahr
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Preisvorteil eines günstigeren Sondervertrags gegenüber der
                  Grundversorgung im untersuchten Modell.
                </p>
                <p className="mt-2 text-xs text-muted-foreground/70">
                  Quelle: verbraucherzentrale bundesverband · 2026
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Mobile View: Sticky Stacking Cards */}
        <div className="md:hidden mt-10 relative flex flex-col gap-4 pb-6">
          {/* Dark card */}
          <div
            className="sticky transition-all duration-300"
            style={{ top: "calc(80px + 0px)", zIndex: 1 }}
          >
            <Reveal delay={0.05}>
              <div className="flex h-full flex-col justify-between rounded-2xl bg-primary p-8 min-h-[280px] shadow-md">
                <div>
                  <AnimatedCounter
                    end={18}
                    suffix=" Mio.+"
                    className="block text-6xl font-normal tracking-tight text-primary-foreground"
                  />
                  <p className="mt-6 max-w-xs text-lg font-semibold text-primary-foreground leading-snug">
                    Haushalte kennen grundlegende Unterschiede bei
                    Energietarifen nicht.
                  </p>
                </div>
                <p className="mt-10 text-xs text-primary-foreground/60">
                  Quelle: verbraucherzentrale bundesverband / forsa · 2026
                </p>
              </div>
            </Reveal>
          </div>

          {/* Light card */}
          <div
            className="sticky transition-all duration-300"
            style={{ top: "calc(80px + 18px)", zIndex: 2 }}
          >
            <Reveal delay={0.05}>
              <div className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-8 min-h-[280px] shadow-md backdrop-blur-md bg-card/98">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Hunderte Euro Sparpotenzial
                  </h3>

                  <div className="mt-6 flex items-stretch gap-6">
                    <div>
                      <AnimatedCounter
                        end={413}
                        suffix=" €"
                        className="block text-4xl font-normal tracking-tight text-foreground"
                      />
                      <span className="mt-2 block text-sm text-muted-foreground">
                        Strom / Jahr
                      </span>
                    </div>
                    <span className="w-px bg-border" aria-hidden="true" />
                    <div>
                      <AnimatedCounter
                        end={878}
                        suffix=" €"
                        className="block text-4xl font-normal tracking-tight text-foreground"
                      />
                      <span className="mt-2 block text-sm text-muted-foreground">
                        Gas / Jahr
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Preisvorteil eines günstigeren Sondervertrags gegenüber der
                    Grundversorgung im untersuchten Modell.
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">
                    Quelle: verbraucherzentrale bundesverband · 2026
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
