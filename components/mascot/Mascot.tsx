"use client";

import { useEffect, useRef } from "react";

// The canvas is in the server HTML at its final size, so the frog never shifts layout.
// three.js (~150 KB gz) loads only after the page is idle, keeping it off the LCP path.
export function Mascot() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stop: (() => void) | undefined;
    let cancelled = false;
    const start = async () => {
      const [T, { mountMascot }] = await Promise.all([import("three"), import("./frog")]);
      // Yield so evaluating three.js and building the scene are separate tasks.
      await new Promise((r) => setTimeout(r, 0));
      const canvas = canvasRef.current;
      if (cancelled || !canvas) return;
      try {
        stop = mountMascot(canvas, T, {
          hoverTarget: buttonRef.current,
          lookArea: buttonRef.current?.closest("header") ?? null,
        });
      } catch {
        // No WebGL: leave the empty button in place.
      }
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    let handle = 0;
    const schedule = () => {
      handle = idle(() => void start());
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      cancelIdle(handle);
      stop?.();
    };
  }, []);

  return (
    <button ref={buttonRef} type="button" aria-label="Say hello to the frog in the suit" className="mascot">
      <canvas ref={canvasRef} width={112} height={112} aria-hidden="true" />
    </button>
  );
}
