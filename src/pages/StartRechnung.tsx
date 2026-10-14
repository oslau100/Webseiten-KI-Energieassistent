import { SimpleFooter } from "@/components/SimpleFooter";

const StartRechnung = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary-ink">
    <main className="flex-grow p-2 sm:p-4" />
    <SimpleFooter />
  </div>
);

export default StartRechnung;
