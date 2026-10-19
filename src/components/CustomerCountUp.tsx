import { useEffect, useRef, useState } from "react";

type Props = { end: number; suffix?: string; locale: string; duration?: number };

function canAnimate() {
  return typeof window !== "undefined" && typeof IntersectionObserver === "function"
    && typeof window.requestAnimationFrame === "function" && typeof window.cancelAnimationFrame === "function"
    && typeof window.matchMedia === "function" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Customer adaptation of Stats' Ehiogie CountUp: same 2s exponential easing, safe lifecycle. */
export function CustomerCountUp({ end, suffix = "", locale, duration = 2000 }: Props) {
  const target = Number.isFinite(end) && end >= 0 ? end : 0;
  const [count, setCount] = useState(() => canAnimate() ? 0 : target);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    // Count/locale edits must not replay an already-started animation.
    if (started.current || !canAnimate() || !Number.isFinite(duration) || duration <= 0) {
      setCount(target);
      started.current = true;
      return;
    }
    let frame: number | undefined;
    let stopped = false;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      stopped = true;
      if (frame !== undefined) window.cancelAnimationFrame(frame);
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting) || started.current || stopped) return;
      started.current = true;
      observer.disconnect();
      let start: number | undefined;
      const step = (timestamp: number) => {
        if (stopped) return;
        start ??= timestamp;
        const progress = Math.max(0, Math.min((timestamp - start) / duration, 1));
        const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setCount(progress === 1 ? target : Math.floor(easeOut * target));
        if (progress < 1) frame = window.requestAnimationFrame(step);
      };
      frame = window.requestAnimationFrame(step);
    }, { threshold: 0.1 });
    const onMotionChange = () => {
      if (!media.matches) return;
      stop();
      observer.disconnect();
      started.current = true;
      setCount(target);
    };
    media.addEventListener?.("change", onMotionChange);
    if (ref.current) observer.observe(ref.current);
    return () => {
      stop();
      observer.disconnect();
      media.removeEventListener?.("change", onMotionChange);
    };
  }, [target, duration]);

  const format = new Intl.NumberFormat(locale);
  return <span ref={ref} className="notranslate">
    <span aria-hidden="true">{format.format(count)}{suffix}</span>
    <span className="sr-only">{format.format(target)}{suffix}</span>
  </span>;
}
