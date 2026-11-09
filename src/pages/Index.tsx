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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <HowItWorks />
        <Comparison />
        <Testimonials />
        <About />
        <Stats />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
