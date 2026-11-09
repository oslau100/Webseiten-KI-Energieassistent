import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

const POSTER = "/brand/hero-poster.webp";
const VIDEO = "/brand/hero.mp4";

type ConnectionInfo = { saveData?: boolean };

/** Öcher V1 only: self-hosted portrait hero video with a fast static poster. */
export const HeroBrandVideo = ({ alt }: { alt: string }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [failed, setFailed] = useState(false);
  const reducedMotion = typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const saveData = typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: ConnectionInfo }).connection?.saveData === true;
  const autoPlayAllowed = !reducedMotion && !saveData;

  const togglePlayback = () => {
    const video = ref.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;
    video.muted = !video.muted;
    setSoundOn(!video.muted);
  };

  return (
    <div className="relative mx-auto w-full max-w-[230px] sm:max-w-[250px] lg:max-w-[270px] xl:max-w-[280px]">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-slate-900 shadow-2xl ring-1 ring-black/10">
        {failed ? (
          <img src={POSTER} alt={alt} width={540} height={960} className="h-full w-full object-contain" />
        ) : (
          <video
            ref={ref}
            className="block h-full w-full object-contain"
            width={540}
            height={960}
            poster={POSTER}
            autoPlay={autoPlayAllowed}
            muted
            loop
            playsInline
            preload={autoPlayAllowed ? "metadata" : "none"}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            aria-label="Öcher Strom – Video aus Aachen"
          >
            <source src={VIDEO} type="video/mp4" />
          </video>
        )}
        {!failed && (
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white shadow-md hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={playing ? "Video pausieren" : "Video abspielen"}
              title={playing ? "Video pausieren" : "Video abspielen"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white shadow-md hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label={soundOn ? "Ton ausschalten" : "Ton einschalten"}
              title={soundOn ? "Ton ausschalten" : "Ton einschalten"}
            >
              {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
