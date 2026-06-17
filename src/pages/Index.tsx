import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PainPoints } from "@/components/PainPoints";
import { FailedSolutions } from "@/components/FailedSolutions";
import { SystemSolution } from "@/components/SystemSolution";
import { SystemOverview } from "@/components/SystemOverview";
import { CrmIntegration } from "@/components/CrmIntegration";
import { SystemUsage } from "@/components/SystemUsage";
import { Comparison } from "@/components/Comparison";
import { AboutSection } from "@/components/AboutSection";
import { CaseStudies } from "@/components/CaseStudies";
import { CollaborationProcess } from "@/components/CollaborationProcess";
import { NextStep } from "@/components/NextStep";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [location]);
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Global Background Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      ></div>
      {/* Radial gradient to fade out grid at edges */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1a231c_100%)] pointer-events-none"></div>

      <div className="relative z-10">
        <Header />
      <main>
        <Hero />
        <div id="problem"><PainPoints /></div>
        <FailedSolutions />
        <div id="loesung"><SystemSolution /></div>
        <SystemOverview />
        <CrmIntegration />
        <SystemUsage />
        <CaseStudies />
        <div id="vorteile"><Comparison /></div>
        <div id="prozess"><CollaborationProcess /></div>
        <div id="ueber-uns"><AboutSection /></div>
        <NextStep />
        <FAQ />
      </main>
      <Footer />
      </div>
    </div>
  );
};

export default Index;
