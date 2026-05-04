import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Jahresrechnung from "./pages/Jahresrechnung";
import Datenschutz from "./pages/Datenschutz";
import Impressum from "./pages/Impressum";
import Start from "./pages/Start";
import Tarif from "./pages/Tarif";
import Auftrag from "./pages/Auftrag";
import AuftragEingegangen from "./pages/AuftragEingegangen";
import RechnungEingegangen from "./pages/RechnungEingegangen";
import Fehler from "./pages/Fehler";
import FehlerRechnung from "./pages/FehlerRechnung";
import Rechnung from "./pages/Rechnung";
import RueckrufAnfordern from "./pages/RueckrufAnfordern";
import { ScrollToTop } from "./components/ScrollToTop";
import { CookieBar } from "./components/CookieBar";
import { I18nProvider } from "./lib/i18n";
import { WebsiteConfigProvider } from "./lib/websiteConfig";
import { AutoPageTranslator } from "./components/AutoPageTranslator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WebsiteConfigProvider>
          <I18nProvider>
          <ScrollToTop />
          <AutoPageTranslator />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jahresrechnung" element={<Jahresrechnung />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/start" element={<Start />} />
            <Route path="/rechnungsprüfung" element={<Start />} />
            <Route path="/rechnungspruefung" element={<Start />} />
            <Route path="/tarif" element={<Tarif />} />
            <Route path="/auftrag" element={<Auftrag />} />
            <Route path="/auftrag-eingegangen" element={<AuftragEingegangen />} />
            <Route path="/rechnung-eingegangen" element={<RechnungEingegangen />} />
            <Route path="/uebermittelt" element={<AuftragEingegangen />} />
            <Route path="/fehler" element={<Fehler />} />
            <Route path="/fehler-rechnung" element={<FehlerRechnung />} />
            <Route path="/rechnung-fehler" element={<FehlerRechnung />} />
            <Route path="/rechnung" element={<Rechnung />} />
            <Route path="/start-rechnung" element={<Rechnung />} />
            <Route path="/rueckruf-anfordern" element={<RueckrufAnfordern />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CookieBar />
        </I18nProvider>
        </WebsiteConfigProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;