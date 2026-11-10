import { useEffect, useRef, useState } from "react";
import { SimpleFooter } from "@/components/SimpleFooter";
import { useLocation } from "react-router-dom";
import { TarifCallbackSection } from "@/components/TarifCallbackSection";
import { useWebsiteConfig } from "@/lib/websiteConfig";

export const calculateTarifIframeHeight = (doc: Document) => {
  const offerRoot = doc.getElementById("tbx2026");
  const bodyStyles = doc.body ? doc.defaultView?.getComputedStyle(doc.body) : null;
  const bodyMarginBottom = bodyStyles ? Number.parseFloat(bodyStyles.marginBottom || "0") || 0 : 0;

  const next = offerRoot
    ? offerRoot.getBoundingClientRect().bottom + bodyMarginBottom
    : Math.max(
        doc.documentElement?.scrollHeight || 0,
        doc.body?.scrollHeight || 0,
        doc.documentElement?.offsetHeight || 0,
        1,
      );

  return Math.max(Math.ceil(next), 1);
};

const Tarif = () => {
  const location = useLocation();
  const { tenant } = useWebsiteConfig();
  const isOecher = tenant?.customer === "oecher";
  const src = `/loaders/tarif.html${location.search || ""}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(1);
  const [view, setView] = useState<{ src: string; stage: "preview" | "offer" } | null>(null);
  const stage = view?.src === src ? view.stage : null;
  const previewActive = isOecher && stage === "preview";

  useEffect(() => {
    if (!isOecher) return;
    const receiveView = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type !== "oecher:offer-view-state") return;
      const stage = event.data.stage;
      setView(stage === "preview" || stage === "offer" ? { src, stage } : null);
    };
    window.addEventListener("message", receiveView);
    return () => window.removeEventListener("message", receiveView);
  }, [isOecher, src]);

  // Same-origin iframe bridge: Meta tracking is owned by the top-level page,
  // where the visitor's consent and the Pixel live. Never send contact data.
  useEffect(() => {
    if (!isOecher) return;

    const params = new URLSearchParams(location.search);
    const expectedUuid = params.get("uuid");
    const expectedSubmissionId = params.get("submission_id");
    let pendingUuid: string | null = null;

    const tryTrackLead = () => {
      if (!pendingUuid) return;
      if (localStorage.getItem("cookie-consent") !== "all") return;
      const surveyStartedAt = Number(sessionStorage.getItem("oecher-survey-started-at") || 0);
      if (!surveyStartedAt || Date.now() - surveyStartedAt > 2 * 60 * 60 * 1000) return;
      const key = `oecher-meta-lead-v1:${pendingUuid}`;
      if (localStorage.getItem(key) === "sent") {
        pendingUuid = null;
        return;
      }
      const fbq = (window as Window & { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq !== "function") return;

      // Mark the completed survey before dispatching to avoid duplicate sends
      // from repeated messages, iframe reloads or page reloads in this browser.
      localStorage.setItem(key, "sent");
      fbq("track", "Lead", {}, { eventID: `oecher-${pendingUuid}` });
      pendingUuid = null;
    };

    const receiveOffer = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const payload = event.data;
      if (!payload || payload.type !== "oecher:offer-rendered") return;
      const uuid = String(payload.uuid || "");
      if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(uuid)) return;
      if (expectedUuid && uuid.toLowerCase() !== expectedUuid.toLowerCase()) return;
      if (!expectedUuid && (!expectedSubmissionId || String(payload.submissionId || "") !== expectedSubmissionId)) return;
      pendingUuid = uuid.toLowerCase();
      tryTrackLead();
    };

    window.addEventListener("message", receiveOffer);
    window.addEventListener("oecher:marketing-consent-updated", tryTrackLead);
    return () => {
      window.removeEventListener("message", receiveOffer);
      window.removeEventListener("oecher:marketing-consent-updated", tryTrackLead);
    };
  }, [isOecher, location.search]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;
    let rafId = 0;

    const scheduleHeightUpdate = () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        try {
          const doc = iframe.contentDocument;
          if (!doc) return;
          setIframeHeight(calculateTarifIframeHeight(doc));
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
    <div
      className={`min-h-screen flex flex-col ${previewActive ? "bg-white" : "bg-background"} text-foreground font-sans selection:bg-primary/20 selection:text-primary`}
      style={previewActive ? { minHeight: "100dvh" } : undefined}
    >
      <main className={previewActive ? "flex flex-1 items-center" : "p-2 sm:p-4"}>
        <iframe
          ref={iframeRef}
          title="Angebotsseite Loader"
          src={src}
          scrolling="no"
          style={{ height: `${iframeHeight}px` }}
          className="w-full border-0 overflow-hidden"
        />
      </main>
      {(!isOecher || stage === "offer") && <TarifCallbackSection />}
      <SimpleFooter preview={previewActive} />
    </div>
  );
};

export default Tarif;
