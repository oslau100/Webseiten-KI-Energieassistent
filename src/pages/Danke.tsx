import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import { relaunchAssets } from "@/lib/relaunchAssets";

/** Bestehende Erfolgsroute aus Production, an das neue Seitenlayout angepasst. */
const Danke = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <header className="mx-auto w-full max-w-7xl px-6 py-4 sm:py-6">
      <Link to="/" aria-label="Energieassistent.io – zur Startseite" className="inline-flex">
        <img
          src={relaunchAssets.logo}
          alt="Energieassistent.io"
          className="h-48 md:h-64 w-auto object-contain mix-blend-multiply"
        />
      </Link>
    </header>

    <main className="flex flex-1 items-center justify-center px-6 py-20 text-center">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Vielen Dank!
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl md:text-2xl">
          Deine Anfrage war erfolgreich. Wir haben alle Informationen erhalten und werden uns in Kürze bei dir melden.
        </p>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </main>

    <Footer />
  </div>
);

export default Danke;
