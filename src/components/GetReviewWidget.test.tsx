import { act, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GET_REVIEW_WIDGET_SRC, GetReviewWidget, getValidReviewWidgetId, RESIZE_MESSAGE_TYPE } from "./GetReviewWidget";

const mainWidgetId = "8179db6b-2332-4da8-84cc-e2e1eb8cdb6c";
const getInstanceId = (iframe: HTMLIFrameElement) => iframe.srcdoc.match(/instanceId: ("[^"]+")/)?.[1].slice(1, -1) || "";

describe("GetReviewWidget", () => {
  it("accepts a trimmed main UUID only", () => {
    expect(getValidReviewWidgetId(` ${mainWidgetId} `)).toBe(mainWidgetId);
    expect(getValidReviewWidgetId("not-a-uuid")).toBe("");
  });

  it("does not render an iframe for missing, blank, malformed, or XSS-like IDs", () => {
    const { rerender } = render(<GetReviewWidget widgetId="   " />);
    for (const invalidId of [null, "not-a-uuid", 'widget-id"><img src=x onerror=alert(1)>']) {
      rerender(<GetReviewWidget widgetId={invalidId} />);
      expect(document.querySelector('[data-testid="get-review-widget"]')).toBeNull();
    }
  });

  it("uses only the configured main ID in an isolated lazy provider document", () => {
    render(<GetReviewWidget widgetId={mainWidgetId} />);
    const iframe = document.querySelector('[data-testid="get-review-widget-main"]') as HTMLIFrameElement;
    expect(iframe.srcdoc).toContain(`src="${GET_REVIEW_WIDGET_SRC}" data-widget-id="${mainWidgetId}"`);
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts");
    expect(iframe.getAttribute("loading")).toBe("lazy");
    expect(document.querySelectorAll(`script[src="${GET_REVIEW_WIDGET_SRC}"]`)).toHaveLength(0);
  });

  it("accepts resize messages only from its matching iframe instance", () => {
    render(<GetReviewWidget widgetId={mainWidgetId} />);
    const iframe = document.querySelector('[data-testid="get-review-widget-main"]') as HTMLIFrameElement;
    const instanceId = getInstanceId(iframe);
    act(() => window.dispatchEvent(new MessageEvent("message", { source: window, data: { type: RESIZE_MESSAGE_TYPE, instanceId, height: 444 } })));
    act(() => window.dispatchEvent(new MessageEvent("message", { source: iframe.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId: "other", height: 444 } })));
    act(() => window.dispatchEvent(new MessageEvent("message", { source: iframe.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId, height: -1 } })));
    expect(iframe.style.height).toBe("320px");
    act(() => window.dispatchEvent(new MessageEvent("message", { source: iframe.contentWindow, data: { type: RESIZE_MESSAGE_TYPE, instanceId, height: 444 } })));
    expect(iframe.style.height).toBe("444px");
  });

  it("removes its message listener and iframe on unmount", () => {
    const removeListener = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<GetReviewWidget widgetId={mainWidgetId} />);
    unmount();
    expect(removeListener).toHaveBeenCalledWith("message", expect.any(Function));
    expect(document.querySelector("iframe")).toBeNull();
    removeListener.mockRestore();
  });
});
