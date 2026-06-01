import { SearchX, Coins, Building2, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedSection } from "./AnimatedSection";
import { useI18n } from "@/lib/i18n";
import { useWebsiteConfig } from "@/lib/websiteConfig";

type ProblemItem = { title: string; description: string; iconKey?: string };

const iconMap = {
  search: SearchX,
  coins: Coins,
  building: Building2,
  calendar: CalendarClock,
} as const;

export const Problem = () => {
  const { t, lang } = useI18n();
  const { getArray, getText } = useWebsiteConfig();

  const fallbackProblems: ProblemItem[] = [
    { title: "Der Markt ist schwer zu überblicken", description: "Hunderte Angebote machen es schwer zu erkennen, welcher Tarif wirklich sinnvoll ist. Deshalb ändern viele ihren Tarif einfach nicht.", iconKey: "search" },
    { title: "Viele glauben, ihr Tarif sei noch günstig", description: "Ein Tarif, der früher gut war, kann heute längst teurer sein. Ohne Prüfung merken viele nicht, dass sie inzwischen mehr zahlen als nötig.", iconKey: "coins" },
    { title: "Viele bleiben in der Grundversorgung", description: "In vielen Regionen ist die Grundversorgung deutlich teurer als alternative Tarife. Trotzdem bleiben viele Haushalte dort oft aus Gewohnheit oder Unwissen.", iconKey: "building" },
    { title: "Tarife werden selten überprüft", description: "Wer seinen Strom- oder Gastarif lange nicht prüft, zahlt häufig mehr als nötig, weil sich Preise und Angebote ständig verändern.", iconKey: "calendar" },
  ];

  const problems = getArray<ProblemItem>(`sections.problem.items.${lang}`, getArray<ProblemItem>("sections.problem.items", fallbackProblems));

  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container px-4 md:px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{getText("sections.problem.headline", t("home_problem_h2"), lang)}</h2>
        </AnimatedSection>
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {problems.map((problem, index) => {
            const Icon = iconMap[(problem.iconKey as keyof typeof iconMap) || "search"];
            return (
              <AnimatedSection key={index} delay={(index + 1) * 150}>
                <Card className="border-none shadow-md bg-muted/30 hover:shadow-lg transition-all h-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"><Icon className="h-6 w-6 text-primary" /></div>
                    <h3 className="text-xl font-bold">{problem.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{problem.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};
