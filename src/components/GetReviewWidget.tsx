import { useEffect, useRef } from "react";

const GET_REVIEW_WIDGET_SRC = "https://getreviewwidget.com/widget.js";
const WIDGET_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type GetReviewWidgetProps = {
  widgetId?: string | null;
  className?: string;
};

export const getValidReviewWidgetId = (widgetId?: string | null) => {
  const normalizedWidgetId = typeof widgetId === "string" ? widgetId.trim() : "";
  return WIDGET_ID_PATTERN.test(normalizedWidgetId) ? normalizedWidgetId : "";
};

/** Loads one GetReviewWidget embed from a validated configured widget ID only. */
export const GetReviewWidget = ({ widgetId, className = "" }: GetReviewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedWidgetId = getValidReviewWidgetId(widgetId);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !normalizedWidgetId) return;

    container.replaceChildren();
    const script = document.createElement("script");
    script.src = GET_REVIEW_WIDGET_SRC;
    script.dataset.widgetId = normalizedWidgetId;
    script.async = true;
    container.appendChild(script);

    return () => {
      script.remove();
      container.replaceChildren();
    };
  }, [normalizedWidgetId]);

  if (!normalizedWidgetId) return null;

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-full min-w-0 ${className}`.trim()}
      data-no-translate="true"
      data-testid="get-review-widget"
    />
  );
};

export { GET_REVIEW_WIDGET_SRC };
