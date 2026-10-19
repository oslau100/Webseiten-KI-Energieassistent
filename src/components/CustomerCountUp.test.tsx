import { StrictMode } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomerCountUp } from "./CustomerCountUp";

let visible: IntersectionObserverCallback;
let motionChange: () => void;
let reduced = false;
let frames: Map<number, FrameRequestCallback>;
let frameId: number;
const disconnect = vi.fn();
const observerDescriptors = [globalThis, window].map(target => ({
  target, descriptor: Object.getOwnPropertyDescriptor(target, "IntersectionObserver")!,
}));
function setObserver(value: typeof IntersectionObserver | undefined) {
  // setup.ts makes this property non-configurable but writable. Change only its value.
  for (const { target } of observerDescriptors) Object.defineProperty(target, "IntersectionObserver", { value });
}
function tick(timestamp: number) {
  const pending = [...frames.values()]; frames.clear();
  act(() => pending.forEach(fn => fn(timestamp)));
}
beforeEach(() => {
  frames = new Map(); frameId = 0; reduced = false;
  setObserver(class implements IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) { visible = callback; }
    root = null; rootMargin = "0px"; thresholds = [0.1];
    observe = vi.fn(); unobserve = vi.fn(); disconnect = disconnect;
    takeRecords = () => [];
  });
  vi.spyOn(window, "matchMedia").mockImplementation(() => ({
    get matches() { return reduced; },
    addEventListener: (_event: string, fn: () => void) => { motionChange = fn; },
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList));
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(fn => { frames.set(++frameId, fn); return frameId; });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(id => { frames.delete(id); });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  for (const { target, descriptor } of observerDescriptors) Object.defineProperty(target, "IntersectionObserver", descriptor);
  disconnect.mockClear();
});
const reveal = () => act(() => visible([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver));
const number = (container: HTMLElement) => container.querySelector('[aria-hidden="true"]')!.textContent;

describe("customer CountUp lifecycle", () => {
  it("runs once after intersection with Ehiogie easing, stable SR end value and locale changes", () => {
    const { container, rerender } = render(<CustomerCountUp end={1500} suffix="+" locale="de" />);
    expect(number(container)).toBe("0+"); expect(container.querySelector(".sr-only")).toHaveTextContent("1.500+");
    expect(frames.size).toBe(0); reveal(); tick(0); tick(1000);
    expect(number(container)).toBe("1.453+");
    rerender(<CustomerCountUp end={1500} suffix="+" locale="en" />);
    expect(number(container)).toBe("1,453+"); tick(2000);
    expect(number(container)).toBe("1,500+"); expect(frames.size).toBe(0);
    reveal(); expect(frames.size).toBe(0);
    rerender(<CustomerCountUp end={1600} suffix="+" locale="ar" />);
    expect(number(container)).toBe(new Intl.NumberFormat("ar").format(1600) + "+");
    expect(frames.size).toBe(0);
  });
  it("shows the final value immediately with reduced motion", () => {
    reduced = true;
    const { container } = render(<CustomerCountUp end={600000} suffix="+ €" locale="fr" />);
    expect(number(container)).toBe(new Intl.NumberFormat("fr").format(600000) + "+ €"); expect(frames.size).toBe(0);
  });
  it.each(["IntersectionObserver", "requestAnimationFrame"])("falls back safely when %s is unavailable", name => {
    if (name === "IntersectionObserver") setObserver(undefined);
    else vi.stubGlobal(name, undefined);
    const { container } = render(<CustomerCountUp end={1500} locale="tr" />);
    expect(number(container)).toBe("1.500");
  });
  it("cancels in-flight frames for a motion preference change and unmount", () => {
    const { container, unmount } = render(<CustomerCountUp end={1500} locale="de" />);
    reveal(); tick(0); expect(frames.size).toBe(1);
    act(() => { reduced = true; motionChange(); });
    expect(number(container)).toBe("1.500"); expect(frames.size).toBe(0);
    unmount(); expect(disconnect).toHaveBeenCalled();
  });
  it("cancels on unmount during an animation", () => {
    const { unmount } = render(<CustomerCountUp end={1500} locale="de" />);
    reveal(); tick(0); unmount(); expect(frames.size).toBe(0);
  });
  it("survives StrictMode effect replay", () => {
    const { container } = render(<StrictMode><CustomerCountUp end={1500} locale="de" /></StrictMode>);
    reveal(); tick(0); tick(2000); expect(number(container)).toBe("1.500");
  });
  it.each([-1, NaN, Infinity])("never renders invalid numeric output for %s", end => {
    reduced = true;
    const { container } = render(<CustomerCountUp end={end} locale="en" />);
    expect(number(container)).toBe("0");
  });
});
