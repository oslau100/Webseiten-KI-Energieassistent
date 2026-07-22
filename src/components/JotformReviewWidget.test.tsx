import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOTFORM_WIDGET_EMBED_BASE, JotformReviewWidget, getValidJotformWidgetId } from "./JotformReviewWidget";
const id = "019f893d595870008c4dd1e6ec285a30e32a";
describe("JotformReviewWidget", () => {
  it("accepts only a trimmed 36-character hexadecimal ID", () => {
    expect(getValidJotformWidgetId(` ${id} `)).toBe(id);
    for (const value of [undefined, null, "", "  ", "019f893d-5958-7000-8c4d-d1e6ec285a30e32a", id.slice(1), `${id}0`, "z".repeat(36), '<script src=x>']) expect(getValidJotformWidgetId(value)).toBe("");
  });
  it("renders no container or script for an invalid ID", () => {
    render(<JotformReviewWidget widgetId="   " />);
    expect(document.querySelector('[data-testid="jotform-review-widget"]')).toBeNull();
    expect(document.querySelector("script")).toBeNull();
  });
  it("creates only the fixed Jotform container and script", () => {
    const { unmount } = render(<JotformReviewWidget widgetId={id} />);
    const container = document.querySelector('[data-testid="jotform-review-widget"]') as HTMLDivElement;
    const script = container.querySelector("script") as HTMLScriptElement;
    expect(container.id).toBe(`JFWebsiteWidget-${id}`);
    expect(script.src).toBe(`${JOTFORM_WIDGET_EMBED_BASE}${id}`);
    unmount();
    expect(document.querySelector('[data-testid="jotform-review-widget"]')).toBeNull();
  });
  it("replaces an old instance when the ID changes", () => {
    const { rerender } = render(<JotformReviewWidget widgetId={id} />);
    const second = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    rerender(<JotformReviewWidget widgetId={second} />);
    expect(document.querySelectorAll('[data-testid="jotform-review-widget"] script')).toHaveLength(1);
    expect(document.querySelector("script")?.src).toBe(`${JOTFORM_WIDGET_EMBED_BASE}${second}`);
  });
});
