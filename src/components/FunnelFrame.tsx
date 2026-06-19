import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface FunnelFrameProps {
  title: string;
  src: string;
  requireUuid?: boolean;
}

export function FunnelFrame({ title, src, requireUuid = false }: FunnelFrameProps) {
  const [searchParams] = useSearchParams();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(720);
  const uuid = searchParams.get("uuid");

  const frameSrc = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const language = params.get("lang") || params.get("language") || "de";
    params.set("lang", language);
    return `${src}?${params.toString()}`;
  }, [searchParams, src]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "tarifbutler:height" && Number.isFinite(data.height)) {
        setHeight(Math.max(520, Math.ceil(data.height)));
      }

      if (data.type === "tarifbutler:navigate" && typeof data.url === "string") {
        window.location.assign(data.url);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (requireUuid && !uuid) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        <Navbar />
        <main className="container mx-auto flex-1 px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Auftrag nicht gefunden</h1>
          <p className="text-muted-foreground mb-8">Bitte starten Sie die Anfrage erneut.</p>
          <a className="font-bold underline" href="/start">Zur Ersparnisprüfung</a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full py-8 md:py-12">
        <iframe
          ref={iframeRef}
          title={title}
          src={frameSrc}
          className="mx-auto block w-full max-w-5xl border-0 bg-transparent"
          style={{ height }}
          allow="clipboard-write; payment"
        />
      </main>
      <Footer />
    </div>
  );
}
