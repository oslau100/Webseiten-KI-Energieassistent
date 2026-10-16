import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SimpleHeader } from "@/components/SimpleHeader";
import { SimpleFooter } from "@/components/SimpleFooter";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary-ink pt-24 md:pt-32"><SimpleHeader /><main className="flex-grow flex items-center justify-center p-4"><div className="text-center"><h1 className="mb-4 text-4xl font-bold">404</h1><p className="mb-4 text-xl text-muted-foreground">Oops! Seite nicht gefunden.</p><a href="/" className="text-primary-ink underline hover:text-primary-ink/90">Zurück zur Startseite</a></div></main><SimpleFooter /></div>
  );
};

export default NotFound;
