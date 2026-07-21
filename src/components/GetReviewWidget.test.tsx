import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GET_REVIEW_WIDGET_SRC, GetReviewWidget, getValidReviewWidgetId } from "./GetReviewWidget";

const mainWidgetId = "8179db6b-2332-4da8-84cc-e2e1eb8cdb6c";
const heroWidgetId = "05c58679-3beb-4511-abfa-73b965d8d7e9";

describe("GetReviewWidget", () => {
  it("accepts trimmed UUID widget IDs only", () => {
    expect(getValidReviewWidgetId(` ${mainWidgetId} `)).toBe(mainWidgetId);
    expect(getValidReviewWidgetId(heroWidgetId)).toBe(heroWidgetId);
    expect(getValidReviewWidgetId("not-a-uuid")).toBe("");
    expect(getValidReviewWidgetId("   ")).toBe("");
  });

  it("does not render or prepare a script for missing, blank, malformed, or XSS-like IDs", () => {
    const { rerender } = render(<GetReviewWidget widgetId="   " />);
    for (const invalidId of [null, "not-a-uuid", 'widget-id"><img src=x onerror=alert(1)>']) {
      rerender(<GetReviewWidget widgetId={invalidId} />);
      expect(document.querySelector('[data-testid="get-review-widget"]')).toBeNull();
      expect(document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toBeNull();
    }
    expect(document.querySelector("img")).toBeNull();
  });

  it("creates an async script with the fixed source for a valid UUID and removes it on unmount", () => {
    const { unmount } = render(<GetReviewWidget widgetId={` ${mainWidgetId} `} />);
    const script = document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`) as HTMLScriptElement;
    expect(script.dataset.widgetId).toBe(mainWidgetId);
    expect(script.async).toBe(true);
    unmount();
    expect(document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toBeNull();
  });

  it("keeps simultaneous valid widgets separate", () => {
    render(<><GetReviewWidget widgetId={heroWidgetId} /><GetReviewWidget widgetId={mainWidgetId} /></>);
    expect([...document.querySelectorAll(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)].map((script) => script.getAttribute("data-widget-id"))).toEqual([heroWidgetId, mainWidgetId]);
  });
});
