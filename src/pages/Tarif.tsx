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
    let rafId = 0;

    const measureHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc) return 1;

      const root = doc.getElementById("tbx2026") || doc.documentElement;
      const rect = root.getBoundingClientRect();
      const bodyStyles = doc.body ? doc.defaultView?.getComputedStyle(doc.body) : null;
      const bodyMarginBottom = bodyStyles ? Number.parseFloat(bodyStyles.marginBottom || "0") || 0 : 0;
      const viewportTop = doc.documentElement.getBoundingClientRect().top;
      const rootBottom = Math.max(0, rect.bottom - viewportTop);

      return Math.max(
        Math.ceil(rootBottom + bodyMarginBottom),
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        1,
      );
    };

    const scheduleHeightUpdate = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        try {
          setIframeHeight(measureHeight());
        } catch {
          // ignore cross-frame access errors
        }
      });
    };

    const onLoad = () => {
      scheduleHeightUpdate();
      try {
        observer?.disconnect();
        const doc = iframe.contentDocument;
        if (!doc) return;
        const observedRoot = doc.getElementById("tbx2026") || doc.documentElement;
        observer = new ResizeObserver(scheduleHeightUpdate);
        observer.observe(observedRoot);
        if (doc.body && doc.body !== observedRoot) observer.observe(doc.body);
        doc.defaultView?.addEventListener("resize", scheduleHeightUpdate);
      } catch {
        // ignore unsupported observers
      }
    };

    iframe.addEventListener("load", onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener("load", onLoad);
      try {
        iframe.contentDocument?.defaultView?.removeEventListener("resize", scheduleHeightUpdate);
      } catch {
        // ignore cross-frame access errors
      }
      observer?.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
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
