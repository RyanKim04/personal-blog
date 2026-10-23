"use client";

import { useEffect, useRef, useState } from "react";
import type { StaticImageData } from "next/image";

type Props = {
  src: string;
  poster?: StaticImageData | string;
  srcName?: string;
  label?: string; // accessible description of the animation
};

// Manim renders: autoplay muted loop, or poster + play button under reduced motion (SPEC §6).
export function Video({ src, poster, label }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [started, setStarted] = useState(false);
  const posterSrc = typeof poster === "string" ? poster : poster?.src;
  const aspect = typeof poster === "object" ? `${poster.width} / ${poster.height}` : "16 / 9";

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Playback starts here rather than via the autoplay attribute, so reduced-motion
    // readers never see the animation run before hydration.
    const update = () => {
      setReduced(mq.matches);
      if (mq.matches) ref.current?.pause();
      else ref.current?.play().catch(() => {});
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="video" style={{ aspectRatio: aspect }}>
      <video
        ref={ref}
        src={src}
        poster={posterSrc}
        muted
        loop
        playsInline
        controls={reduced && started}
        preload="metadata"
        aria-label={label}
      />
      {reduced && !started && (
        <button
          type="button"
          className="video-play"
          aria-label={label ? `Play: ${label}` : "Play animation"}
          onClick={() => {
            setStarted(true);
            ref.current?.play();
          }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M8 5v14l11-7z" fill="currentColor" />
          </svg>
        </button>
      )}
    </div>
  );
}
