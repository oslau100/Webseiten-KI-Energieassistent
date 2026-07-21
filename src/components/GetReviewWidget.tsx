import { useEffect, useRef } from "react";

const GET_REVIEW_WIDGET_SRC = "https://getreviewwidget.com/widget.js";

type GetReviewWidgetProps = {
  widgetId?: string | null;
  className?: string;
};

/** Loads one GetReviewWidget embed from a configured widget ID only. */
export const GetReviewWidget = ({ widgetId, className = "" }: GetReviewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedWidgetId = typeof widgetId === "string" ? widgetId.trim() : "";

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
      className={`w-full max-w-full overflow-hidden ${className}`.trim()}
      data-no-translate="true"
      data-testid="get-review-widget"
    />
  );
};

export { GET_REVIEW_WIDGET_SRC };
