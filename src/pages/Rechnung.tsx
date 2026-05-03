import { useEffect, useRef, useState } from "react";
import { SimpleFooter } from "@/components/SimpleFooter";
import { useLocation } from "react-router-dom";

const Rechnung = () => {
  const location = useLocation();
  const src = `/loaders/rechnung.html${location.search || ""}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(1);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    const updateHeight = (shrink = false) => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;

        let previousHeight = "";
        if (shrink) {
          previousHeight = iframe.style.height;
          iframe.style.height = "1px";
        }

        const next = Math.max(
          doc.documentElement?.scrollHeight || 0,
          doc.body?.scrollHeight || 0,
          doc.documentElement?.offsetHeight || 0,
          1,
        );

        if (shrink) iframe.style.height = previousHeight;
        setIframeHeight(Math.ceil(next));
      } catch {
        // ignore cross-frame access errors
      }
    };

    const onLoad = () => {
      updateHeight(true);
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        observer = new ResizeObserver(() => updateHeight(false));
        observer.observe(doc.documentElement);
        if (doc.body) observer.observe(doc.body);
      } catch {
        // ignore unsupported observers
      }
    };

    iframe.addEventListener("load", onLoad);
    onLoad();

    return () => {
      iframe.removeEventListener("load", onLoad);
      observer?.disconnect();
    };
  }, [src]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <main className="p-2 sm:p-4">
        <iframe
          ref={iframeRef}
          title="Rechnung Survey Loader"
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

export default Rechnung;
