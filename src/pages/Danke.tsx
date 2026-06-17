import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Danke = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col">
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
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#1a231c_100%)] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow flex items-center justify-center py-24 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Vielen Dank!
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Deine Anfrage war erfolgreich. Wir haben alle Informationen erhalten und werden uns in Kürze bei dir melden.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <a href="/">Zurück zur Startseite</a>
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Danke;
