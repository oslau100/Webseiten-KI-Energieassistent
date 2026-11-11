import { useEffect, useRef, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { useWebsiteConfig } from "@/lib/websiteConfig";
import { useI18n } from "@/lib/i18n";

const oecherThousandsSeparators: Record<string, string> = {
  de: ".",
  en: ",",
  tr: ".",
  ru: " ",
  ar: ",",
  it: ".",
  zh: ",",
  hi: ",",
  es: ".",
  fr: " ",
  nl: ".",
  pl: " ",
};

const CountUp = ({ end, suffix = "", duration = 2000, locale = "de" }: { end: number; suffix?: string; duration?: number; locale?: string }) => {
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

  const formattedCount = locale === "de"
    ? count.toLocaleString("de-DE")
    : count.toLocaleString("en-US").replace(/,/g, oecherThousandsSeparators[locale] ?? ",");

  return <span ref={ref} className="notranslate">{formattedCount}{suffix}</span>;
};

type StatItem = { end: number; suffix?: string; label: string };

export const Stats = () => {
  const { getArray, getText, tenant } = useWebsiteConfig();
  const { lang, t } = useI18n();
  const isOecher = tenant?.customer === "oecher";
  const defaultHouseholdLabel = isOecher
    ? "Haushalte in Aachen nutzen den Energieassistenten"
    : "Haushalte nutzen den Energieassistenten";

  const fallbackStats: StatItem[] = [
    { end: 15000, suffix: "+", label: "Tarife und Rechnungen bereits geprüft" },
    { end: isOecher ? 5000 : 2000, suffix: "+", label: defaultHouseholdLabel },
    { end: 900000, suffix: "+ €", label: "an Energiekosten bereits eingespart" },
  ];

  const stats = getArray<StatItem>(`sections.stats.items.${lang}`, getArray<StatItem>("sections.stats.items", fallbackStats));
  const householdLabel = isOecher
    ? getText("sections.stats.households_label", t("stats_households_label"), lang)
    : defaultHouseholdLabel;

  return (
    <section className="py-12 bg-background"><div className="container px-4 md:px-6"><AnimatedSection className="text-center max-w-4xl mx-auto mb-10"><h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{getText("sections.stats.headline", t("home_testimonials_h2"), lang)}</h2></AnimatedSection><AnimatedSection className="max-w-5xl mx-auto border-2 border-primary rounded-3xl p-8 md:p-12 shadow-lg shadow-primary/5"><div className="grid gap-8 md:grid-cols-3 text-center divide-y md:divide-y-0 md:divide-x divide-border">{stats.map((item, idx) => <div key={idx} className={`space-y-2 ${idx > 0 ? "pt-8 md:pt-0" : "pt-4 md:pt-0"}`}><h3 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter"><CountUp end={item.end} suffix={item.suffix || ""} locale={isOecher ? lang : "de"} /></h3><p className="text-muted-foreground md:text-lg">{idx === 1 && item.label === defaultHouseholdLabel ? householdLabel : item.label}</p></div>)}</div></AnimatedSection></div></section>
  );
};
