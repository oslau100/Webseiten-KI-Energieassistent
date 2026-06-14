import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link } from "react-router-dom";

const COOKIE_NAME = "tarifbutler_cookie_consent";
const COOKIE_DAYS = 365;

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(true);

  useEffect(() => {
    const hasConsent = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveConsent = (marketing: boolean) => {
    const d = new Date();
    d.setTime(d.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
    const value = JSON.stringify({ essential: true, marketing });
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6 sm:p-8 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Privatsphäre-Einstellungen</h2>
          
          <div className="space-y-4 text-[13px] sm:text-sm text-gray-700 leading-relaxed">
            <p>
              Um Ihnen ein optimales Website-Erlebnis zu bieten, verwendet <Link to="/" className="text-blue-600 hover:underline">TarifButler</Link> Cookies und ähnliche Technologien und verarbeitet Ihre personenbezogenen Daten. Dies hilft uns dabei, die Plattform stabil und sicher zu halten („Essenzielle Cookies“), unser Angebot durch Analysen Ihrer Nutzung zu verbessern, Fehler zu minimieren, neue Funktionen zu testen, sowie Ihnen auf Ihre Interessen zugeschnittene Inhalte und Werbung, auch auf Drittseiten, anzubieten („Marketing Cookies“).
            </p>
            


            <p>
              <strong>Essenzielle Cookies</strong> sind für das Funktionieren der Website notwendig und können nicht deaktiviert werden. <strong>Marketing Cookies</strong> helfen uns, Ihr Nutzererlebnis zu verbessern. Sie haben die Wahl, welche Verarbeitungen und Cookies Sie zulassen möchten:
            </p>

            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Alle akzeptieren:</strong> Indem Sie zustimmen, erlauben Sie uns und Drittanbietern, alle Cookies zu setzen und für die oben genannten Zwecke Ihre Daten zu verarbeiten.</li>
              <li><strong>Einstellungen speichern:</strong> Wählen Sie aus, welche Cookies Sie akzeptieren. Essenzielle Cookies sind vorausgewählt und erforderlich. Sie können Ihre Präferenzen für Analytische Cookies, Marketing Cookies und den Google Kundenabgleich anpassen.</li>
              <li><strong>Nur essenzielle Cookies akzeptieren:</strong> Wir verwenden nur notwendige Cookies, um unsere Website bereitzustellen.</li>
            </ul>

            <p>
              Bitte beachten Sie, dass bei der Auswahl von Marketing Cookies Drittanbieter involviert sein können, die möglicherweise in Ländern außerhalb der EU sitzen, in denen kein gleichwertiges Datenschutzniveau garantiert wird. Dies könnte Ihre Rechte bezüglich Ihrer Daten beeinträchtigen, einschließlich des Zugriffs durch staatliche Stellen ohne effektive Rechtsmittel für Sie. Ihre Zustimmung umfasst auch diese Übertragung und Verarbeitung. Für weitere Informationen zu unseren Cookies, deren Zweck und Ihren Rechten, besuchen Sie bitte unsere Datenschutzerklärung unter „<Link to="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>“.
            </p>
          </div>

        </div>

        <div className="p-6 sm:px-8 sm:py-6 border-t border-gray-100 bg-white shrink-0">
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="font-medium text-gray-900 text-sm sm:text-base">Marketing</span>
              <Switch 
                checked={marketingAccepted} 
                onCheckedChange={setMarketingAccepted}
                className="data-[state=checked]:bg-[#008a4b]"
              />
            </div>
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <span className="font-medium text-gray-900 text-sm sm:text-base">Essenziell</span>
              <Switch 
                checked={true} 
                disabled
                className="opacity-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-5">
            <Link to="/datenschutz" className="hover:text-gray-900 transition-colors">Datenschutzerklärung</Link>
            <Link to="/impressum" className="hover:text-gray-900 transition-colors">Impressum</Link>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="w-full sm:w-1/2 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-gray-900 border-0 font-semibold h-12"
              onClick={() => saveConsent(marketingAccepted)}
            >
              Einstellungen speichern
            </Button>
            <Button 
              className="w-full sm:w-1/2 bg-[#008a4b] hover:bg-[#00733e] text-white font-semibold h-12"
              onClick={() => saveConsent(true)}
            >
              Alles akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
