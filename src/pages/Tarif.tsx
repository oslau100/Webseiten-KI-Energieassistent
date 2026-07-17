import { useEffect, useRef, useState } from "react";
import { SimpleFooter } from "@/components/SimpleFooter";
import { useLocation } from "react-router-dom";

const Tarif = () => {
  const location = useLocation();
  const src = `/loaders/tarif.html${location.search || ""}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(1);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    let resizeFrame: number | null = null;
    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        const offerRoot = doc.getElementById("tbx2026");
        const bodyMarginBottom = doc.body ? Number.parseFloat(iframe.contentWindow?.getComputedStyle(doc.body).marginBottom || "0") : 0;
        const next = offerRoot
          ? offerRoot.getBoundingClientRect().bottom + bodyMarginBottom
          : Math.max(doc.documentElement?.scrollHeight || 0, doc.body?.scrollHeight || 0, doc.documentElement?.offsetHeight || 0, 1);
        setIframeHeight(Math.ceil(next));
      } catch {
        // ignore cross-frame access errors
      }
    };
    const scheduleHeightUpdate = () => {
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = null;
        updateHeight();
      });
    };

    const onLoad = () => {
      updateHeight();
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        observer = new ResizeObserver(scheduleHeightUpdate);
        const offerRoot = doc.getElementById("tbx2026");
        observer.observe(offerRoot || doc.documentElement);
      } catch {
        // ignore unsupported observers
      }
    };

    iframe.addEventListener("load", onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
      if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    };
  }, [src]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <main className="p-2 sm:p-4">
        <iframe
          ref={iframeRef}
          title="Angebotsseite Loader"
          src={src}
          scrolling="no"
          style={{ height: `${iframeHeight}px` }}
          className="w-full border-0 overflow-hidden"
        />
      </main>
      <SimpleFooter />
    </div>
  );
};

export default Tarif;
