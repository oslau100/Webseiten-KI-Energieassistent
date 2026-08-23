import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsent } from "./components/CookieConsent";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Start from "./pages/Start";
import Tarif from "./pages/Tarif";
import Auftrag from "./pages/Auftrag";
import AuftragEingegangen from "./pages/AuftragEingegangen";
import Fehler from "./pages/Fehler";
import Privacy from "./pages/Privacy";
import Imprint from "./pages/Imprint";
import { AffiliateAuth, AffiliateLanding, AffiliatePortal } from "./pages/Affiliate";
import { ReferralCapture } from "./components/affiliate/ReferralCapture";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ReferralCapture />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ueber-uns" element={<About />} />
          <Route path="/start" element={<Start />} />
          <Route path="/tarif" element={<Tarif />} />
          <Route path="/auftrag" element={<Auftrag />} />
          <Route path="/auftrag-eingegangen" element={<AuftragEingegangen />} />
          <Route path="/fehler" element={<Fehler />} />
          <Route path="/datenschutz" element={<Privacy />} />
          <Route path="/impressum" element={<Imprint />} />
          <Route path="/empfehlungsprogramm" element={<AffiliateLanding />} />
          <Route path="/empfehlungsprogramm/anmelden" element={<AffiliateAuth kind="anmelden" />} />
          <Route path="/empfehlungsprogramm/registrieren" element={<AffiliateAuth kind="registrieren" />} />
          <Route path="/empfehlungsprogramm/passwort-vergessen" element={<AffiliateAuth kind="passwort-vergessen" />} />
          <Route path="/empfehlungsprogramm/passwort-zuruecksetzen" element={<AffiliateAuth kind="passwort-zuruecksetzen" />} />
          <Route path="/empfehlungsprogramm/aktivieren" element={<AffiliateAuth kind="aktivieren" />} />
          <Route path="/empfehlungsprogramm/portal" element={<AffiliatePortal section="portal" />} />
          <Route path="/empfehlungsprogramm/empfehlungen" element={<AffiliatePortal section="empfehlungen" />} />
          <Route path="/empfehlungsprogramm/belohnungen" element={<AffiliatePortal section="belohnungen" />} />
          <Route path="/empfehlungsprogramm/profil" element={<AffiliatePortal section="profil" />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <CookieConsent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
