import { useEffect, useRef, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { useI18n } from "@/lib/i18n";

const CountUp = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let frame: number | undefined;
    let observer: IntersectionObserver | undefined;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
        setCount(end);
        return;
      }
      setCount(0);
      let first: number | undefined;
      const tick = (now: number) => {
        if (first === undefined) first = now;
        const progress = Math.min((now - first) / duration, 1);
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(progress === 1 ? end : Math.floor(ease * end));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
    };
    if (typeof window.IntersectionObserver !== "function") {
      start();
    } else {
      observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          observer?.disconnect();
          start();
        }
      }, { threshold: 0.1 });
      observer.observe(element);
    }
    return () => {
      observer?.disconnect();
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
  }, [end, duration]);

  return <span ref={ref} className="notranslate">{count.toLocaleString("de-DE")}{suffix}</span>;
};

type StatItem = { end: number; suffix?: string; label: string };

export const Stats = () => {
  const { getArray, getText } = useWebsiteConfig();
  const { lang } = useI18n();

  const fallbackStats: StatItem[] = [
    { end: 15000, suffix: "+", label: "Tarife und Rechnungen bereits geprüft" },
    { end: 2000, suffix: "+", label: "Haushalte nutzen den Energieassistenten" },
    { end: 900000, suffix: "+ €", label: "an Energiekosten bereits eingespart" },
  ];

  const stats = getArray<StatItem>(`sections.stats.items.${lang}`, getArray<StatItem>("sections.stats.items", fallbackStats));

  return (
    <section className="py-12 bg-background"><div className="container px-4 md:px-6"><AnimatedSection className="text-center max-w-4xl mx-auto mb-10"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{getText("sections.stats.headline", "Über 1.500 Haushalte nutzen bereits den digitalen Energieassistenten", lang)}</h2></AnimatedSection><AnimatedSection className="max-w-5xl mx-auto border-2 border-primary rounded-3xl p-8 md:p-12 shadow-lg shadow-primary/5"><div className="grid gap-8 md:grid-cols-3 text-center divide-y md:divide-y-0 md:divide-x divide-border">{stats.map((item, idx) => <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-8 md:pt-0" : "pt-4 md:pt-0"}`}><h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter"><CountUp end={item.end} suffix={item.suffix || ""} /></h3><p className="text-muted-foreground md:text-lg">{item.label}</p></div>)}</div></AnimatedSection></div></section>
  );
};
