import { SimpleHeader } from "@/components/SimpleHeader";
import { SimpleFooter } from "@/components/SimpleFooter";

const FehlerRechnung = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pt-24 md:pt-32">
      <SimpleHeader />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl text-center space-y-6 md:space-y-8">
          <h1 className="mx-auto max-w-3xl text-3xl md:text-5xl font-bold leading-tight">
            Da ist etwas schiefgelaufen
          </h1>
          <p className="mx-auto max-w-3xl text-base md:text-xl text-foreground/90 leading-relaxed">
            Deine Rechnungsprüfung konnte gerade nicht vollständig übermittelt werden. Bitte versuche es in wenigen Minuten erneut.
          </p>
          <p className="mx-auto max-w-3xl text-sm md:text-base text-foreground/80 leading-relaxed">
            Falls der Fehler weiterhin auftritt, kontaktiere uns bitte direkt – wir helfen dir weiter.
          </p>
          <div className="flex flex-col items-center gap-3">
            <a
              href="https://www.kromen-energieassistent.de/rechnung"
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base md:text-lg font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Zurück zur Rechnungsprüfung
            </a>
            <a
              href="https://www.kromen-energieassistent.de"
              className="text-sm md:text-base font-medium text-primary underline-offset-4 hover:underline"
            >
              Zur Startseite
            </a>
          </div>
        </div>
      </main>
      <SimpleFooter />
    </div>
  );
};

export default FehlerRechnung;
