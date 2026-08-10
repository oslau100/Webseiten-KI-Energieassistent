import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ marketing: true, essential: true })
    );
    setIsVisible(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "cookie-consent",
      JSON.stringify({ marketing, essential: true })
    );
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-[#FDFDFD] text-black rounded-t-2xl sm:rounded-2xl shadow-xl max-w-4xl w-full max-h-[60vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-4 md:p-8 space-y-3 md:space-y-6 overflow-y-auto">
          <h2 className="text-lg md:text-2xl font-bold text-[#1a231c]">Privatsphäre-Einstellungen</h2>

          <div className="space-y-3 md:space-y-4 text-xs md:text-sm text-slate-600">
            <p>
              Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet{" "}
              <span className="text-primary font-medium">Energieassistent.io</span>{" "}
              Cookies und ähnliche Technologien und verarbeitet Ihre
              personenbezogenen Daten. Dies hilft uns dabei, die Plattform stabil
              und sicher zu halten („Essenzielle Cookies“), unser Angebot durch
              Analysen Ihrer Nutzung zu verbessern, Fehler zu minimieren, neue
              Funktionen zu testen, sowie Ihnen auf Ihre Interessen zugeschnittene
              Inhalte und Werbung, auch auf Drittseiten, anzubieten („Marketing
              Cookies“).
            </p>

            <p>
              <strong>Essenzielle Cookies</strong> sind für das Funktionieren der
              Website notwendig und können nicht deaktiviert werden.{" "}
              <strong>Marketing Cookies</strong> helfen uns, Ihr Nutzererlebnis
              zu verbessern. Sie haben die Wahl, welche Verarbeitungen und Cookies
              Sie zulassen möchten:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Alle akzeptieren:</strong> Indem Sie zustimmen, erlauben
                Sie uns und Drittanbietern, alle Cookies zu setzen und für die
                oben genannten Zwecke Ihre Daten zu verarbeiten.
              </li>
              <li>
                <strong>Einstellungen speichern:</strong> Wählen Sie aus, welche
                Cookies Sie akzeptieren. Essenzielle Cookies sind vorausgewählt
                und erforderlich. Sie können Ihre Präferenzen für Analytische
                Cookies, Marketing Cookies und den Google Kundenabgleich anpassen.
              </li>
              <li>
                <strong>Nur essenzielle Cookies akzeptieren:</strong> Wir
                verwenden nur notwendige Cookies, um unsere Website
                bereitzustellen.
              </li>
            </ul>

            <p>
              Bitte beachten Sie, dass bei der Auswahl von Marketing Cookies
              Drittanbieter involviert sein können, die möglicherweise in Ländern
              außerhalb der EU sitzen, in denen kein gleichwertiges
              Datenschutzniveau garantiert wird. Dies könnte Ihre Rechte bezüglich
              Ihrer Daten beeinträchtigen, einschließlich des Zugriffs durch
              staatliche Stellen ohne effektive Rechtsmittel für Sie. Ihre
              Zustimmung umfasst auch diese Übertragung und Verarbeitung. Für
              weitere Informationen zu unseren Cookies, deren Zweck und Ihren
              Rechten, besuchen Sie bitte unsere Datenschutzerklärung unter „
              <Link
                to="/datenschutz"
                className="text-primary hover:underline font-medium"
              >
                Datenschutzerklärung
              </Link>
              “.
            </p>
          </div>

          <div className="bg-slate-100 p-4 rounded-xl flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Marketing</span>
              <Switch
                checked={marketing}
                onCheckedChange={setMarketing}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-slate-300"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500">
                Essenziell
              </span>
              <Switch
                checked={true}
                disabled
                className="data-[state=checked]:bg-black/50 opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link to="/datenschutz" className="hover:underline">
              Datenschutzerklärung
            </Link>
            <Link to="/impressum" className="hover:underline">
              Impressum
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 p-3 md:p-8 bg-slate-50 flex flex-col sm:flex-row gap-2 md:gap-3 justify-between mt-auto sm:rounded-b-2xl shrink-0">
          <Button
            variant="secondary"
            onClick={handleSave}
            className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-black border-none"
          >
            Einstellungen speichern
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="w-full sm:w-auto bg-black text-white hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90"
          >
            Alles akzeptieren
          </Button>
        </div>
      </div>
    </div>
  );
}
