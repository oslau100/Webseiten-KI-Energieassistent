import { useEffect, useRef } from "react";

const JOTFORM_WIDGET_EMBED_BASE = "https://www.jotform.com/website-widgets/embed/";
const JOTFORM_WIDGET_ID_PATTERN = /^[0-9a-f]{36}$/i;

type JotformReviewWidgetProps = { widgetId?: string | null; className?: string };

export const getValidJotformWidgetId = (widgetId?: string | null) => {
  const normalized = typeof widgetId === "string" ? widgetId.trim() : "";
  return JOTFORM_WIDGET_ID_PATTERN.test(normalized) ? normalized : "";
};

export const JotformReviewWidget = ({ widgetId, className = "" }: JotformReviewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedWidgetId = getValidJotformWidgetId(widgetId);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !normalizedWidgetId) return;
    container.replaceChildren();
    const script = document.createElement("script");
    script.src = `${JOTFORM_WIDGET_EMBED_BASE}${normalizedWidgetId}`;
    script.async = true;
    script.dataset.jotformWidgetId = normalizedWidgetId;
    container.appendChild(script);
    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, [normalizedWidgetId]);

  if (!normalizedWidgetId) return null;
  return <div ref={containerRef} id={`JFWebsiteWidget-${normalizedWidgetId}`} className={`w-full max-w-full min-w-0 overflow-hidden ${className}`.trim()} data-testid="jotform-review-widget" />;
};

export { JOTFORM_WIDGET_EMBED_BASE };
