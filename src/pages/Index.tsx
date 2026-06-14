import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { Comparison } from "@/components/Comparison";
import { CallToAction } from "@/components/CallToAction";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { BannerCTA } from "@/components/BannerCTA";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <Features />
          <HowItWorks />
          <CallToAction />
          <Comparison />
          <Testimonials />
          <FAQ />
          <BannerCTA />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
