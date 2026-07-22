import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GET_REVIEW_WIDGET_SRC, GetReviewWidget, getValidReviewWidgetId, HERO_LOAD_TIMEOUT_MS, RESIZE_MESSAGE_TYPE } from "./GetReviewWidget";

const mainWidgetId = "8179db6b-2332-4da8-84cc-e2e1eb8cdb6c";
const heroWidgetId = "05c58679-3beb-4511-abfa-73b965d8d7e9";

const getInstanceId = (iframe: HTMLIFrameElement) => iframe.srcdoc.match(/instanceId: ("[^"]+")/)?.[1].slice(1, -1) || "";

describe("GetReviewWidget", () => {
  it("accepts trimmed UUID widget IDs only", () => {
    expect(getValidReviewWidgetId(` ${mainWidgetId} `)).toBe(mainWidgetId);
    expect(getValidReviewWidgetId(heroWidgetId)).toBe(heroWidgetId);
    expect(getValidReviewWidgetId("not-a-uuid")).toBe("");
    expect(getValidReviewWidgetId("   ")).toBe("");
  });

  it("does not render an iframe for missing, blank, malformed, or XSS-like IDs", () => {
    const { rerender } = render(<GetReviewWidget widgetId="   " />);
    for (const invalidId of [null, "not-a-uuid", 'widget-id"><img src=x onerror=alert(1)>']) {
      rerender(<GetReviewWidget widgetId={invalidId} />);
      expect(document.querySelector('[data-testid="get-review-widget"]')).toBeNull();
      expect(document.querySelector("iframe")).toBeNull();
    }
    expect(document.querySelector("img")).toBeNull();
  });

  it("puts each hero and main widget in a separate isolated provider document", () => {
    render(<><GetReviewWidget widgetId={heroWidgetId} variant="hero" /><GetReviewWidget widgetId={mainWidgetId} variant="main" /></>);
    const hero = document.querySelector('[data-testid="get-review-widget-hero"]') as HTMLIFrameElement;
    const main = document.querySelector('[data-testid="get-review-widget-main"]') as HTMLIFrameElement;

    expect(hero).toBeTruthy();
    expect(main).toBeTruthy();
    expect(hero).not.toBe(main);
    expect(hero.srcdoc).toContain(`src="${GET_REVIEW_WIDGET_SRC}" data-widget-id="${heroWidgetId}"`);
    expect(main.srcdoc).toContain(`src="${GET_REVIEW_WIDGET_SRC}" data-widget-id="${mainWidgetId}"`);
    expect(hero.srcdoc).not.toContain(mainWidgetId);
    expect(main.srcdoc).not.toContain(heroWidgetId);
    expect(document.querySelectorAll(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toHaveLength(0);
    expect(hero.getAttribute("sandbox")).toBe("allow-scripts");
  });

  it("keeps the hero compact until visible provider content marks it ready", () => {
    render(<><GetReviewWidget widgetId={heroWidgetId} variant="hero" /><GetReviewWidget widgetId={mainWidgetId} variant="main" /></>);
    const hero = document.querySelector('[data-testid="get-review-widget-hero"]') as HTMLIFrameElement;
    const main = document.querySelector('[data-testid="get-review-widget-main"]') as HTMLIFrameElement;
    const heroInstanceId = getInstanceId(hero);
    const mainInstanceId = getInstanceId(main);

    act(() => {
      window.dispatchEvent(new MessageEvent("message", { source: hero.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId: heroInstanceId, height: 222 } }));
    });
    expect(screen.getByTestId("get-review-widget-hero-skeleton")).toBeTruthy();
    expect(hero.style.height).toBe("0px");
    expect(main.style.height).toBe("320px");

    act(() => {
      window.dispatchEvent(new MessageEvent("message", { source: hero.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId: heroInstanceId, height: 222, ready: true } }));
    });
    expect(document.querySelector('[data-testid="get-review-widget-hero-skeleton"]')).toBeNull();
    expect(hero.style.height).toBe("222px");
    expect(hero.className).toContain("opacity-100");

    act(() => {
      window.dispatchEvent(new MessageEvent("message", { source: hero.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId: mainInstanceId, height: 444 } }));
      window.dispatchEvent(new MessageEvent("message", { source: window, data: { type: RESIZE_MESSAGE_TYPE, instanceId: heroInstanceId, height: 444 } }));
      window.dispatchEvent(new MessageEvent("message", { source: hero.contentWindow, data: { type: "other", instanceId: heroInstanceId, height: 444 } }));
    });
    expect(hero.style.height).toBe("222px");
    expect(main.style.height).toBe("320px");
  });

  it("removes an unresolved hero loading area after the timeout", () => {
    vi.useFakeTimers();
    render(<GetReviewWidget widgetId={heroWidgetId} variant="hero" />);
    expect(screen.getByTestId("get-review-widget-hero-skeleton")).toBeTruthy();
    act(() => vi.advanceTimersByTime(HERO_LOAD_TIMEOUT_MS));
    expect(document.querySelector('[data-testid="get-review-widget"]')).toBeNull();
    vi.useRealTimers();
  });

  it("loads hero embeds eagerly and main embeds lazily", () => {
    render(<><GetReviewWidget widgetId={heroWidgetId} variant="hero" /><GetReviewWidget widgetId={mainWidgetId} variant="main" /></>);
    expect(document.querySelector('[data-testid="get-review-widget-hero"]')?.getAttribute("loading")).toBe("eager");
    expect(document.querySelector('[data-testid="get-review-widget-main"]')?.getAttribute("loading")).toBe("lazy");
  });

  it("removes its message listener and embedded iframe on unmount", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<GetReviewWidget widgetId={mainWidgetId} />);
    expect(document.querySelector("iframe")).toBeTruthy();
    unmount();
    expect(removeListener).toHaveBeenCalledWith("message", expect.any(Function));
    expect(document.querySelector("iframe")).toBeNull();
    removeListener.mockRestore();
  });
});
