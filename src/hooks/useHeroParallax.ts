"use client";

import { useEffect, useRef } from "react";

const MAX_X_PX = 14;
const MAX_Y_PX = 9;
const SCROLL_Y_PX = 10;
const LERP = 0.07;
const OVERSCALE = 1.07;

/**
 * Lightweight mouse/touch + scroll parallax for the aerial hero backdrop.
 * Prefer transform only; respects prefers-reduced-motion.
 * True 3D exploration (orbit / joysticks) is planned later — keep this 2D.
 */
export function useHeroParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      el.style.transform = `scale(${OVERSCALE})`;
      return;
    }

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;
    let curX = 0;
    let curY = 0;
    let running = true;

    const applyPointer = (clientX: number, clientY: number) => {
      const nx = (clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      targetX = Math.max(-1, Math.min(1, nx)) * MAX_X_PX;
      targetY = Math.max(-1, Math.min(1, ny)) * MAX_Y_PX;
    };

    const onPointerMove = (event: PointerEvent) => {
      applyPointer(event.clientX, event.clientY);
    };

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollY = Math.min(SCROLL_Y_PX, (window.scrollY / maxScroll) * SCROLL_Y_PX);
    };

    const tick = () => {
      if (!running) return;
      curX += (targetX - curX) * LERP;
      curY += (targetY + scrollY - curY) * LERP;
      el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0) scale(${OVERSCALE})`;
      raf = requestAnimationFrame(tick);
    };

    onScroll();
    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return ref;
}
