import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "energieassistent_cookie_consent_v1";

interface ConsentSettings {
  essential: boolean;
  marketing: boolean;
  decided: boolean;
}

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        // Show after a tiny delay for smooth appearance
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (marketingEnabled: boolean) => {
    const consent: ConsentSettings = {
      essential: true,
      marketing: marketingEnabled,
      decided: true,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="w-full max-w-[560px] rounded-2xl bg-card border border-border/70 p-6 sm:p-7 shadow-2xl text-foreground animate-in zoom-in-95 duration-200"
      >
        <h2
          id="cookie-title"
          className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
        >
          Privatsphäre-Einstellungen
        </h2>

        <div className="mt-4 space-y-3 text-[13px] sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet{" "}
            <span className="font-medium text-primary">
              energieassistent.io
            </span>{" "}
            Cookies und ähnliche Technologien.
          </p>
          <p>
            <strong className="text-foreground font-semibold">
              Essenzielle Cookies
            </strong>{" "}
            sind für die Funktion der Website notwendig und können nicht
            deaktiviert werden.{" "}
            <strong className="text-foreground font-semibold">
              Marketing Cookies
            </strong>{" "}
            helfen uns, Inhalte und Angebote für Sie zu verbessern.
          </p>
          <p>
            Weitere Informationen finden Sie in der{" "}
            <Link
              to="/datenschutz"
              className="text-primary hover:underline font-medium"
            >
              Datenschutzerklärung
            </Link>
            .
          </p>
        </div>

        {/* Toggles bar */}
        <div className="mt-5 flex items-center gap-6 rounded-xl bg-muted/60 border border-border/40 px-5 py-3.5">
          {/* Marketing Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Marketing
            </span>
            <Switch
              checked={marketing}
              onCheckedChange={setMarketing}
              className="data-[state=checked]:bg-primary"
            />
          </label>

          {/* Essenziell Toggle (Locked on) */}
          <label className="flex items-center gap-3 cursor-not-allowed select-none opacity-90">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Essenziell
            </span>
            <Switch
              checked={true}
              disabled
              className="data-[state=checked]:bg-primary cursor-not-allowed"
            />
          </label>
        </div>

        {/* Links row */}
        <div className="mt-4 flex items-center gap-4 text-xs sm:text-[13px] text-muted-foreground">
          <Link
            to="/datenschutz"
            className="hover:text-foreground transition-colors hover:underline"
          >
            Datenschutzerklärung
          </Link>
          <Link
            to="/impressum"
            className="hover:text-foreground transition-colors hover:underline"
          >
            Impressum
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => saveConsent(marketing)}
            className="w-full inline-flex items-center justify-center rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-sm sm:text-[15px] py-3 px-4 transition-colors"
          >
            Einstellungen speichern
          </button>
          <button
            type="button"
            onClick={() => saveConsent(true)}
            className="w-full inline-flex items-center justify-center rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm sm:text-[15px] py-3 px-4 shadow-sm transition-colors"
          >
            Alles akzeptieren
          </button>
        </div>
      </div>
    </div>
  );
}
