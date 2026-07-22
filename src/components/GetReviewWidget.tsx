import { useEffect, useId, useMemo, useRef, useState } from "react";

const GET_REVIEW_WIDGET_SRC = "https://getreviewwidget.com/widget.js";
const WIDGET_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESIZE_MESSAGE_TYPE = "get-review-widget:resize";
const HERO_LOAD_TIMEOUT_MS = 8_000;

type GetReviewWidgetProps = { widgetId?: string | null; className?: string; variant?: "hero" | "main" };

const variantOptions = {
  hero: { initialHeight: 56, title: "Kundenbewertungen im Hero-Bereich" },
  main: { initialHeight: 320, title: "Kundenbewertungen" },
} as const;

export const getValidReviewWidgetId = (widgetId?: string | null) => {
  const normalizedWidgetId = typeof widgetId === "string" ? widgetId.trim() : "";
  return WIDGET_ID_PATTERN.test(normalizedWidgetId) ? normalizedWidgetId : "";
};

const createWidgetDocument = (widgetId: string, instanceId: string) => `<!doctype html>
<html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;width:100%;max-width:100%;overflow:hidden}</style></head>
<body>
<script src="${GET_REVIEW_WIDGET_SRC}" data-widget-id="${widgetId}" async></script>
<script>
(() => {
  const rootId = "grw-widget-${widgetId}";
  const report = (ready) => {
    const root = document.getElementById(rootId);
    if (root) { root.style.width = "100%"; root.style.maxWidth = "none"; }
    const height = Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    const visibleProviderContent = Boolean(root && root.children.length && root.getBoundingClientRect().height >= 40);
    parent.postMessage({ type: "${RESIZE_MESSAGE_TYPE}", instanceId: ${JSON.stringify(instanceId)}, height, ready: ready && visibleProviderContent }, "*");
  };
  const observe = () => report(true);
  new ResizeObserver(observe).observe(document.body);
  new MutationObserver(observe).observe(document.body, { childList: true, subtree: true, attributes: true });
  addEventListener("load", observe);
  setTimeout(() => report(false), 0);
})();
</script>
</body></html>`;

/** Isolates provider scripts, which otherwise select the last widget script globally. */
export const GetReviewWidget = ({ widgetId, className = "", variant = "main" }: GetReviewWidgetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const instanceId = useId();
  const normalizedWidgetId = getValidReviewWidgetId(widgetId);
  const options = variantOptions[variant];
  const isHero = variant === "hero";
  const [height, setHeight] = useState(options.initialHeight);
  const [heroReady, setHeroReady] = useState(!isHero);
  const [heroTimedOut, setHeroTimedOut] = useState(false);
  const srcDoc = useMemo(() => normalizedWidgetId ? createWidgetDocument(normalizedWidgetId, instanceId) : "", [instanceId, normalizedWidgetId]);

  useEffect(() => {
    setHeight(options.initialHeight);
    setHeroReady(!isHero);
    setHeroTimedOut(false);
  }, [isHero, normalizedWidgetId, options.initialHeight]);

  useEffect(() => {
    if (!isHero || !normalizedWidgetId || heroReady) return;
    const timeout = window.setTimeout(() => setHeroTimedOut(true), HERO_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [heroReady, isHero, normalizedWidgetId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const iframe = iframeRef.current;
      const data = event.data as Record<string, unknown> | null;
      if (
        !iframe || event.source !== iframe.contentWindow || !data || data.type !== RESIZE_MESSAGE_TYPE || data.instanceId !== instanceId ||
        typeof data.height !== "number" || !Number.isFinite(data.height) || data.height <= 0 || data.height > 5000
      ) return;

      setHeight(Math.max(options.initialHeight, Math.ceil(data.height)));
      if (isHero && data.ready === true) setHeroReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [instanceId, isHero, options.initialHeight]);

  if (!normalizedWidgetId || heroTimedOut) return null;

  return (
    <div className={`w-full max-w-full min-w-0 overflow-hidden ${className}`.trim()} data-no-translate="true" data-testid="get-review-widget">
      {isHero && !heroReady && <div className="h-14 w-full animate-pulse rounded-xl bg-muted/70" data-testid="get-review-widget-hero-skeleton" />}
      <iframe
        ref={iframeRef}
        title={options.title}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        loading={isHero ? "eager" : "lazy"}
        className={`block w-full max-w-full border-0 transition-opacity duration-200 ${isHero && !heroReady ? "h-0 opacity-0" : "opacity-100"}`}
        style={{ height: isHero && !heroReady ? "0px" : `${height}px` }}
        data-testid={`get-review-widget-${variant}`}
        data-widget-id={normalizedWidgetId}
      />
    </div>
  );
};

export { GET_REVIEW_WIDGET_SRC, HERO_LOAD_TIMEOUT_MS, RESIZE_MESSAGE_TYPE };
