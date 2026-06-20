import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

interface FunnelFrameProps {
  title: string;
  src: string;
  requireUuid?: boolean;
  showChrome?: boolean;
}

function getSafeNavigationUrl(rawUrl: string): string | null {
  try {
    const target = new URL(rawUrl, window.location.origin);
    if (target.origin !== window.location.origin) {
      return null;
    }
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}

export function FunnelFrame({ title, src, requireUuid = false, showChrome = true }: FunnelFrameProps) {
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

  const measureIframeHeight = useCallback(() => {
    if (showChrome) return;

    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc) return;

    const body = doc.body;
    const html = doc.documentElement;
    if (!body || !html) return;

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    const nextHeight = Math.max(
      520,
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    );

    setHeight(Math.ceil(nextHeight));
  }, [showChrome]);


  useEffect(() => {
    if (showChrome) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    let frameObserver: ResizeObserver | null = null;
    let animationFrame = 0;

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureIframeHeight);
    };

    const attachObserver = () => {
      frameObserver?.disconnect();
      frameObserver = null;

      const doc = iframe.contentDocument;
      if (!doc) {
        scheduleMeasure();
        return;
      }

      if (doc.body) {
        frameObserver = new ResizeObserver(scheduleMeasure);
        frameObserver.observe(doc.body);
      }

      if (doc.documentElement) {
        doc.documentElement.style.overflow = "hidden";
      }

      if (doc.body) {
        doc.body.style.overflow = "hidden";
      }

      scheduleMeasure();
    };

    iframe.addEventListener("load", attachObserver);
    attachObserver();

    return () => {
      iframe.removeEventListener("load", attachObserver);
      frameObserver?.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [frameSrc, measureIframeHeight, showChrome]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "tarifbutler:height" && Number.isFinite(data.height)) {
        setHeight(Math.max(520, Math.ceil(data.height)));
        measureIframeHeight();
      }

      if (data.type === "tarifbutler:navigate" && typeof data.url === "string") {
        const safeUrl = getSafeNavigationUrl(data.url);
        if (safeUrl) {
          window.location.assign(safeUrl);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [measureIframeHeight]);

  if (requireUuid && !uuid) {
    return (
      <div className="min-h-screen bg-background flex flex-col font-sans">
        {showChrome && <Navbar />}
        <main className="container mx-auto flex-1 px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Auftrag nicht gefunden</h1>
          <p className="text-muted-foreground mb-8">Bitte starten Sie die Anfrage erneut.</p>
          <a className="font-bold underline" href="/start">Zur Ersparnisprüfung</a>
        </main>
        {showChrome && <Footer />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {showChrome && <Navbar />}
      <main className={showChrome ? "flex-1 w-full py-8 md:py-12" : "flex-1 w-full py-0"}>
        <iframe
          ref={iframeRef}
          title={title}
          src={frameSrc}
          className={showChrome ? "mx-auto block w-full max-w-5xl border-0 bg-transparent" : "mx-auto block w-full max-w-5xl overflow-hidden border-0 bg-transparent"}
          style={{ height, overflow: "hidden" }}
          scrolling="no"
          allow="clipboard-write; payment"
        />
      </main>
      {showChrome && <Footer />}
    </div>
  );
}
