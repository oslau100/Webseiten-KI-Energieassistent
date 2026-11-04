import { useId, useRef, type PointerEvent } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { hasDrawing } from "@/lib/signing/presentation";
import type { SignatureStroke } from "@/lib/signing/contract";

/** Normalized vectors stay in memory; no image upload, persistence or PDF stamping. */
export function SignaturePad({ strokes, onChange, label }: {
  strokes: SignatureStroke[]; onChange: (next: SignatureStroke[]) => void; label: string;
}) {
  const { t } = useI18n();
  const hint = useId();
  const pointer = useRef<{ id: number; previous: SignatureStroke[]; stroke: SignatureStroke } | null>(null);
  const point = (event: PointerEvent<SVGSVGElement>): readonly [number, number] => {
    const box = event.currentTarget.getBoundingClientRect();
    if (!box.width || !box.height) return [0, 0];
    return [Math.max(0, Math.min(600, (event.clientX - box.left) / box.width * 600)),
      Math.max(0, Math.min(200, (event.clientY - box.top) / box.height * 200))];
  };
  const end = (event: PointerEvent<SVGSVGElement>, cancelled = false) => {
    const active = pointer.current;
    if (!active || active.id !== event.pointerId) return;
    // Clear first: releasing capture can itself dispatch lostpointercapture.
    pointer.current = null;
    if (cancelled) onChange(active.previous);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  return <div className="space-y-3">
    <p>{t("signing_draw")}</p>
    <svg viewBox="0 0 600 200" role="img" aria-label={label} aria-describedby={hint}
      className="w-full rounded-lg border-2 border-slate-500 bg-white touch-none" style={{ maxHeight: 240 }}
      onPointerDown={event => {
        if (pointer.current !== null || event.button !== 0) return;
        event.preventDefault();
        const active = { id: event.pointerId, previous: strokes, stroke: [point(event)] };
        pointer.current = active;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        onChange([...active.previous, active.stroke]);
      }}
      onPointerMove={event => {
        const active = pointer.current;
        if (!active || active.id !== event.pointerId) return;
        // Pointer moves may arrive before React renders the preceding onChange.
        active.stroke = [...active.stroke, point(event)];
        onChange([...active.previous, active.stroke]);
      }}
      onPointerUp={event => end(event)} onPointerCancel={event => end(event, true)} onLostPointerCapture={event => end(event, true)}>
      {strokes.map((stroke, index) => <polyline key={index} points={stroke.map(p => p.join(",")).join(" ")}
        stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
    </svg>
    <p id={hint} className="text-sm text-muted-foreground">{t("signing_captureHelp")}</p>
    <Button type="button" variant="outline" onClick={() => { pointer.current = null; onChange([]); }}>{t("signing_clear")}</Button>
    <span role="status" className="ms-3 text-sm">{hasDrawing(strokes) ? t("signing_captured") : ""}</span>
  </div>;
}
