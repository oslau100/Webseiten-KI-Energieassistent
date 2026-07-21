import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GET_REVIEW_WIDGET_SRC, GetReviewWidget } from "./GetReviewWidget";

describe("GetReviewWidget", () => {
  it("does not render or load a script for missing, blank, or non-string IDs", () => {
    const { rerender } = render(<GetReviewWidget widgetId="   " />);
    expect(document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toBeNull();
    rerender(<GetReviewWidget widgetId={null} />);
    expect(document.querySelector('[data-testid="get-review-widget"]')).toBeNull();
  });

  it("creates one isolated async script with the fixed source and a text-only ID", () => {
    const unsafeId = ' widget-id"><img src=x onerror=alert(1)> ';
    const { unmount } = render(<GetReviewWidget widgetId={unsafeId} />);
    const script = document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`) as HTMLScriptElement;

    expect(script).toBeTruthy();
    expect(script.dataset.widgetId).toBe('widget-id"><img src=x onerror=alert(1)>');
    expect(script.async).toBe(true);
    expect(document.querySelector("img")).toBeNull();

    unmount();
    expect(document.querySelector(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toBeNull();
  });

  it("keeps simultaneous widgets separate even though they share the provider source", () => {
    render(<><GetReviewWidget widgetId="hero" /><GetReviewWidget widgetId="main" /></>);
    expect([...document.querySelectorAll(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)].map((script) => script.getAttribute("data-widget-id"))).toEqual(["hero", "main"]);
  });
});
