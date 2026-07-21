import { useEffect, useId, useMemo, useRef, useState } from "react";

const GET_REVIEW_WIDGET_SRC = "https://getreviewwidget.com/widget.js";
const WIDGET_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RESIZE_MESSAGE_TYPE = "get-review-widget:resize";

type GetReviewWidgetProps = {
  widgetId?: string | null;
  className?: string;
  variant?: "hero" | "main";
};

const variantOptions = {
  hero: { initialHeight: 120, title: "Kundenbewertungen im Hero-Bereich" },
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
  const reportHeight = () => {
    const height = Math.ceil(Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    parent.postMessage({ type: "${RESIZE_MESSAGE_TYPE}", instanceId: ${JSON.stringify(instanceId)}, height }, "*");
  };
  new ResizeObserver(reportHeight).observe(document.body);
  new MutationObserver(reportHeight).observe(document.body, { childList: true, subtree: true, attributes: true });
  addEventListener("load", reportHeight);
  setTimeout(reportHeight, 0);
})();
</script>
</body></html>`;

/**
 * Isolates each provider embed in its own document because the provider uses
 * document.currentScript and otherwise selects the last widget script globally.
 */
export const GetReviewWidget = ({ widgetId, className = "", variant = "main" }: GetReviewWidgetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const instanceId = useId();
  const normalizedWidgetId = getValidReviewWidgetId(widgetId);
  const options = variantOptions[variant];
  const [height, setHeight] = useState(options.initialHeight);
  const srcDoc = useMemo(
    () => normalizedWidgetId ? createWidgetDocument(normalizedWidgetId, instanceId) : "",
    [instanceId, normalizedWidgetId],
  );

  useEffect(() => {
    setHeight(options.initialHeight);
  }, [options.initialHeight, normalizedWidgetId]);

  useEffect(() => {
    const onMessage = (event: MessageEvent<unknown>) => {
      const iframe = iframeRef.current;
      const data = event.data as Record<string, unknown> | null;
      if (
        !iframe ||
        event.source !== iframe.contentWindow ||
        !data ||
        data.type !== RESIZE_MESSAGE_TYPE ||
        data.instanceId !== instanceId ||
        typeof data.height !== "number" || !Number.isFinite(data.height) || data.height <= 0 || data.height > 5000
      ) return;

      setHeight(Math.max(options.initialHeight, Math.ceil(data.height)));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [instanceId, options.initialHeight]);

  if (!normalizedWidgetId) return null;

  return (
    <div className={`w-full max-w-full min-w-0 overflow-hidden ${className}`.trim()} data-no-translate="true" data-testid="get-review-widget">
      <iframe
        ref={iframeRef}
        title={options.title}
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="block w-full max-w-full border-0"
        style={{ height: `${height}px` }}
        data-testid={`get-review-widget-${variant}`}
        data-widget-id={normalizedWidgetId}
      />
    </div>
  );
};

export { GET_REVIEW_WIDGET_SRC, RESIZE_MESSAGE_TYPE };
