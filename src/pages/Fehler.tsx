import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AlertTriangle } from "lucide-react";

const Fehler = () => (
  <div className="min-h-screen bg-background flex flex-col font-sans">
    <Navbar />
    <main className="container mx-auto flex-1 px-4 py-20 text-center">
      <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-destructive" />
      <h1 className="text-4xl font-extrabold mb-4">Da ist etwas schiefgelaufen</h1>
      <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
        Bitte versuchen Sie es erneut oder starten Sie die Ersparnisprüfung noch einmal.
      </p>
      <a className="font-bold underline" href="/start">Zur Ersparnisprüfung</a>
    </main>
    <Footer />
  </div>
);

export default Fehler;
