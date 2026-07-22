import { StrictMode } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOTFORM_WIDGET_EMBED_BASE, JotformReviewWidget, getValidJotformWidgetId } from "./JotformReviewWidget";

const id = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

describe("JotformReviewWidget", () => {
  it("accepts a trimmed 36-character hexadecimal ID only", () => {
    expect(getValidJotformWidgetId(id)).toBe(id);
    expect(getValidJotformWidgetId(` ${id} `)).toBe(id);
    for (const value of [undefined, null, "", "  ", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", id.slice(1), `${id}0`, "z".repeat(36), '<script src=x>']) {
      expect(getValidJotformWidgetId(value)).toBeNull();
    }
  });

  it("does not create a container or script for an invalid ID", () => {
    render(<JotformReviewWidget widgetId="   " />);
    expect(document.querySelector('[data-testid="jotform-review-widget"]')).toBeNull();
    expect(document.querySelector(`script[src^="${JOTFORM_WIDGET_EMBED_BASE}"]`)).toBeNull();
  });

  it("uses only the fixed Jotform container ID and script URL", () => {
    const { unmount } = render(<JotformReviewWidget widgetId={id} />);
    const container = document.querySelector('[data-testid="jotform-review-widget"]') as HTMLDivElement;
    expect(container.id).toBe(`JFWebsiteWidget-${id}`);
    expect(container.querySelector("script")?.src).toBe(`${JOTFORM_WIDGET_EMBED_BASE}${id}`);
    unmount();
    expect(document.querySelector(`script[src="${JOTFORM_WIDGET_EMBED_BASE}${id}"]`)).toBeNull();
  });

  it("replaces the old instance when the ID changes", () => {
    const { rerender } = render(<JotformReviewWidget widgetId={id} />);
    const secondId = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    rerender(<JotformReviewWidget widgetId={secondId} />);
    expect(document.querySelectorAll('[data-testid="jotform-review-widget"] script')).toHaveLength(1);
    expect(document.querySelector(`script[src="${JOTFORM_WIDGET_EMBED_BASE}${id}"]`)).toBeNull();
    expect(document.querySelector(`script[src="${JOTFORM_WIDGET_EMBED_BASE}${secondId}"]`)).toBeTruthy();
  });

  it("does not duplicate the embed in StrictMode and cleans up on unmount", () => {
    const { unmount } = render(<StrictMode><JotformReviewWidget widgetId={id} /></StrictMode>);
    expect(document.querySelectorAll('[data-testid="jotform-review-widget"]')).toHaveLength(1);
    expect(document.querySelectorAll(`script[src="${JOTFORM_WIDGET_EMBED_BASE}${id}"]`)).toHaveLength(1);
    unmount();
    expect(document.querySelector('[data-testid="jotform-review-widget"]')).toBeNull();
    expect(document.querySelector(`script[src="${JOTFORM_WIDGET_EMBED_BASE}${id}"]`)).toBeNull();
  });
});
