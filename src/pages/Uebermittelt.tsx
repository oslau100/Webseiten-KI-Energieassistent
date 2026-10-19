import { SimpleHeader } from "@/components/SimpleHeader";
import { SimpleFooter } from "@/components/SimpleFooter";

const Uebermittelt = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary-ink pt-24 md:pt-32"><SimpleHeader /><main className="flex-grow flex items-center justify-center p-4">{/* Freier Bereich für /uebermittelt */}</main><SimpleFooter /></div>
);

export default Uebermittelt;
