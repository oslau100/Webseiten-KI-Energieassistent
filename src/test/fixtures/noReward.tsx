// Isolated synthetic visual QA fixture. No production route, API or policy inference.
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AffiliateLayout } from "@/components/affiliate/AffiliateLayout";
import { NoRemunerationCard } from "@/components/affiliate/PartnerSettings";
import { PartnerList } from "@/components/affiliate/PartnerList";
import "@/index.css";

createRoot(document.getElementById("root")!).render(<MemoryRouter initialEntries={["/empfehlungsprogramm/profil"]}><AffiliateLayout kind="portal"><div className="mx-auto max-w-6xl space-y-5 px-4 py-10"><h1 className="text-3xl font-bold">Einstellungen</h1><NoRemunerationCard /><section className="space-y-4 rounded-[2rem] border p-6"><h2 className="text-xl font-bold">Auszahlungen</h2><PartnerList title="Historische Auszahlungen" firstColumn="Betrag" rows={[{ key: "qa-history", primary: "30,00 €", status: "Ausgezahlt", date: "Ausgezahlt am 03.02.2026" }]} /></section></div></AffiliateLayout></MemoryRouter>);
