import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "./AnimatedSection";
import { useWebsiteConfig } from "@/lib/websiteConfig";

type Review = { title: string; text: string; name: string };

export const Testimonials = () => {
  const { t, withLang, lang } = useI18n();
  const { getArray, getText } = useWebsiteConfig();

  const fallbackReviews: Review[] = [
    {
      title: "Ich war ehrlich gesagt erst...",
      text: "Ich war ehrlich gesagt erst skeptisch. Bei Stromtarifen habe ich immer das Gefühl, irgendwo steckt ein Haken. Dieser Assistent hat mir aber nur eine einzige Empfehlung gezeigt und erklärt, warum dieser Tarif sicher ist. Das hat mir wirklich geholfen, eine Entscheidung zu treffen.",
      name: "Sabine M.",
    },
    { title: "Den Service kann ich nur...", text: "Den Service kann ich nur empfehlen! Ich spare jetzt rund 380 € im Jahr, ohne mich selbst um Tarife kümmern zu müssen.", name: "Thomas K." },
    { title: "Endlich ein klarer Überblick...", text: "Super einfach und transparent. Ich wusste gar nicht, wie viel ich eigentlich zu viel zahle. Der Wechsel lief komplett reibungslos.", name: "Ayşe Y." },
  ];

  const reviews = getArray<Review>(`sections.testimonials.home_reviews.${lang}`, getArray<Review>("sections.testimonials.home_reviews", fallbackReviews));

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 md:px-6">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <p className="text-primary font-semibold tracking-wide uppercase text-sm">{getText("sections.testimonials.kicker", "Das sagen unsere Nutzer", lang)}</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{t("home_testimonials_h2")}</h2>
        </AnimatedSection>
        <AnimatedSection delay={200} className="max-w-5xl mx-auto px-12 relative">
          <Carousel opts={{ align: "start" }} className="w-full">
            <CarouselContent>
              {reviews.map((review, index) => (
                <CarouselItem key={index} className="basis-[85%] md:basis-1/2 lg:basis-1/2 pl-4">
                  <div className="p-1 h-full">
                    <Card className="h-full border-none shadow-md bg-background">
                      <CardContent className="flex flex-col h-full justify-between p-6 md:p-8 space-y-4 md:space-y-6">
                        <div className="space-y-3 md:space-y-4">
                          <div className="flex gap-1 text-primary">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 md:h-5 md:w-5 fill-current" />)}</div>
                          <h3 className="font-bold text-base md:text-lg">{review.title}</h3>
                          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{review.text}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 md:pt-4">
                          <span className="font-bold text-sm">{review.name}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12 h-12 w-12 border-none shadow-md" />
            <CarouselNext className="-right-12 h-12 w-12 border-none shadow-md" />
          </Carousel>
        </AnimatedSection>
        <AnimatedSection delay={400} className="mt-16 text-center">
          <Button size="lg" className="h-14 px-10 text-lg font-semibold shadow-lg shadow-primary/20" asChild>
            <Link to={withLang("/start")}>{t("cta_check_savings")}</Link>
          </Button>
        </AnimatedSection>
      </div>
    </section>
  );
};
