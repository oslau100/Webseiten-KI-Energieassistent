import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2 } from "lucide-react";

const AuftragEingegangen = () => (
  <div className="min-h-screen bg-background flex flex-col font-sans">
    <Navbar />
    <main className="container mx-auto flex-1 px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-primary" />
      <h1 className="text-4xl font-extrabold mb-4">Auftrag eingegangen</h1>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Vielen Dank! Ihr Wechselauftrag wurde erfolgreich übermittelt. Das TarifButler-Team prüft Ihre Angaben und meldet sich bei Bedarf bei Ihnen.
      </p>
    </main>
    <Footer />
  </div>
);

export default AuftragEingegangen;
