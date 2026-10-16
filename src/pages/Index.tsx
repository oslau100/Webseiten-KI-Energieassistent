import { PageChrome } from "@/components/PageChrome";
import { SectionLayout } from "@/components/SectionLayout";
import { FinalCTA } from "@/components/FinalCTA";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { HowItWorks } from "@/components/HowItWorks";
import { Comparison } from "@/components/Comparison";
import { Testimonials } from "@/components/Testimonials";
import { About } from "@/components/About";
import { Stats } from "@/components/Stats";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary-ink">
      <PageChrome page="home" id="header"><Header /></PageChrome>
      <main>
        <SectionLayout page="home" ids={["hero", "problem", "solution", "how_it_works", "comparison", "testimonials", "about", "stats", "faq", "final_cta"]}>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Comparison />
        <Testimonials />
        <About />
        <Stats />
        <FAQ />
        <FinalCTA />
        </SectionLayout>
      </main>
      <PageChrome page="home" id="footer"><Footer /></PageChrome>
    </div>
  );
};

export default Index;
