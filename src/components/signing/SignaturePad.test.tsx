import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SignatureStroke } from "@/lib/signing/contract";
import { captureKey, changeDrawing, type SigningDraft } from "@/lib/signing/presentation";
import { signingFixture } from "@/test/signingFixtures";
import { SignaturePad } from "./SignaturePad";

vi.mock("@/lib/i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

const completed: SignatureStroke[] = [[[10, 10], [100, 50]]];

// jsdom does not implement PointerEvent/capture. Supply explicit pointer data
// and model capture release, including its synchronous lost-capture callback.
function pointer(svg: SVGSVGElement, type: string, pointerId = 1, x = 20, pointerType = "mouse") {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: 30 });
  Object.defineProperties(event, { pointerId: { value: pointerId }, pointerType: { value: pointerType } });
  fireEvent(svg, event);
}

function surface(label = "person A") {
  const svg = screen.getByRole("img", { name: label }) as unknown as SVGSVGElement;
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    x: 0, y: 0, left: 0, top: 0, right: 600, bottom: 200, width: 600, height: 200, toJSON() {},
  });
  const captured = new Set<number>();
  Object.assign(svg, {
    setPointerCapture: vi.fn((id: number) => captured.add(id)),
    hasPointerCapture: (id: number) => captured.has(id),
    releasePointerCapture: vi.fn((id: number) => {
      captured.delete(id);
      pointer(svg, "lostpointercapture", id);
    }),
  });
  return svg;
}

function Pad({ initial = [] }: { initial?: SignatureStroke[] }) {
  const [strokes, setStrokes] = useState(initial);
  return <SignaturePad label="person A" strokes={strokes} onChange={setStrokes} />;
}

describe("SignaturePad pointer interruption", () => {
  it.each(["mouse", "pen", "touch"].flatMap(type =>
    ["pointercancel", "lostpointercapture"].map(event => [type, event])))
  ("discards only the active %s stroke on %s and invalidates its confirmations", (type, event) => {
    const manifest = signingFixture();
    const own = captureKey(manifest.requirements[0]);
    const other = captureKey(manifest.requirements[2]);
    let latest: SigningDraft;
    function SigningPads() {
      const [draft, setDraft] = useState<SigningDraft>({
        reviewed: { "synthetic-customer": true, "synthetic-account-holder": true },
        confirmations: Object.fromEntries(manifest.requirements.map(r => [r.id, true])),
        strokes: { [own]: completed, [other]: completed },
      });
      latest = draft;
      return <>
        <SignaturePad label="person A" strokes={draft.strokes[own]}
          onChange={next => setDraft(current => changeDrawing(manifest, current, own, next))} />
        <SignaturePad label="person B" strokes={draft.strokes[other]}
          onChange={next => setDraft(current => changeDrawing(manifest, current, other, next))} />
        <button onClick={() => setDraft(current => ({ ...current,
          confirmations: Object.fromEntries(manifest.requirements.map(r => [r.id, true])),
        }))}>Confirm while drawing</button>
      </>;
    }
    render(<SigningPads />);
    const svg = surface();
    pointer(svg, "pointerdown", 1, 20, type);
    pointer(svg, "pointermove", 1, 60, type);
    expect(svg.querySelectorAll("polyline")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Confirm while drawing" }));
    expect(latest!.confirmations[manifest.requirements[0].id]).toBe(true);
    pointer(svg, event, 1, 60, type);
    expect(latest!.strokes[own]).toEqual(completed);
    expect(latest!.confirmations).toEqual({ [manifest.requirements[2].id]: true });
    expect(latest!.strokes[other]).toEqual(completed);
    expect(latest!.reviewed).toEqual({ "synthetic-customer": true, "synthetic-account-holder": true });
    expect(svg.querySelectorAll("polyline")).toHaveLength(1);
    pointer(svg, "pointermove", 1, 90, type);
    pointer(svg, "pointerup", 1, 90, type);
    expect(latest!.strokes[own]).toEqual(completed);
    pointer(svg, "pointerdown", 2, 30, type);
    pointer(svg, "pointermove", 2, 80, type);
    pointer(svg, "pointerup", 2, 80, type);
    expect(svg.querySelectorAll("polyline")).toHaveLength(2);
  });

  it.each(["pointercancel", "lostpointercapture"])("removes an otherwise valid partial signature on %s", event => {
    render(<Pad />);
    const svg = surface();
    pointer(svg, "pointerdown");
    pointer(svg, "pointermove", 1, 80);
    expect(screen.getByRole("status")).toHaveTextContent("signing_captured");
    pointer(svg, event);
    expect(svg.querySelectorAll("polyline")).toHaveLength(0);
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("preserves a normally completed stroke when capture is released", () => {
    render(<Pad />);
    const svg = surface();
    pointer(svg, "pointerdown");
    pointer(svg, "pointermove", 1, 80);
    pointer(svg, "pointerup");
    pointer(svg, "lostpointercapture");
    pointer(svg, "pointercancel");
    expect(svg.querySelector("polyline")).toHaveAttribute("points", "20,30 80,30");
    expect(screen.getByRole("status")).toHaveTextContent("signing_captured");
  });

  it("ignores other pointers and delayed events from an earlier pointer", () => {
    render(<Pad />);
    const svg = surface();
    pointer(svg, "pointerdown");
    pointer(svg, "pointermove", 1, 50);
    for (const event of ["pointerdown", "pointermove", "pointerup", "pointercancel", "lostpointercapture"]) {
      pointer(svg, event, 2, 100, "touch");
    }
    pointer(svg, "pointermove", 1, 80);
    pointer(svg, "pointerup");
    expect(svg.querySelector("polyline")).toHaveAttribute("points", "20,30 50,30 80,30");
    pointer(svg, "pointerdown", 2);
    pointer(svg, "lostpointercapture", 1);
    pointer(svg, "pointermove", 2, 90);
    pointer(svg, "pointercancel", 2);
    expect(svg.querySelectorAll("polyline")).toHaveLength(1);
    expect(svg.querySelector("polyline")).toHaveAttribute("points", "20,30 50,30 80,30");
  });

  it("keeps rapid moves without waiting for controlled props to render", () => {
    const onChange = vi.fn();
    render(<SignaturePad label="person A" strokes={completed} onChange={onChange} />);
    const svg = surface();
    act(() => {
      pointer(svg, "pointerdown");
      pointer(svg, "pointermove", 1, 40);
      pointer(svg, "pointermove", 1, 60);
    });
    expect(onChange).toHaveBeenLastCalledWith([...completed, [[20, 30], [40, 30], [60, 30]]]);
    expect(onChange.mock.calls[0][0]).toEqual([...completed, [[20, 30]]]);
    pointer(svg, "pointercancel");
    expect(onChange).toHaveBeenLastCalledWith(completed);
    expect(onChange).toHaveBeenCalledTimes(4);
  });

  it("does not restore cleared strokes on a delayed interruption", () => {
    render(<Pad initial={completed} />);
    const svg = surface();
    pointer(svg, "pointerdown");
    pointer(svg, "pointermove", 1, 80);
    fireEvent.click(screen.getByRole("button", { name: "signing_clear" }));
    pointer(svg, "pointercancel");
    pointer(svg, "lostpointercapture");
    expect(svg.querySelectorAll("polyline")).toHaveLength(0);
  });
});
