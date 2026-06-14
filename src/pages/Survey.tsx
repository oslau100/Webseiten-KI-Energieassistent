import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SurveyWidget } from "@/components/SurveyWidget";

const Survey = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-12">
          <SurveyWidget />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Survey;
