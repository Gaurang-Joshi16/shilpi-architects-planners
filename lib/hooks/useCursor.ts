"use client";

import { useEffect, useRef } from "react";

/**
 * useCursor — custom cursor tracking hook
 *
 * Dot follows mouse instantly.
 * Ring lerps at factor 0.18 per frame.
 * Hover states added on: a, .lab, .news-card, .category-card, .commission-btn, button
 */
export function useCursor(
  dotRef: React.RefObject<HTMLDivElement | null>,
  ringRef: React.RefObject<HTMLDivElement | null>
) {
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    function onMouseMove(e: MouseEvent) {
      mx.current = e.clientX;
      my.current = e.clientY;
      dot!.style.left = mx.current + "px";
      dot!.style.top = my.current + "px";
    }

    function cursorLoop() {
      rx.current += (mx.current - rx.current) * 0.18;
      ry.current += (my.current - ry.current) * 0.18;
      ring!.style.left = rx.current + "px";
      ring!.style.top = ry.current + "px";
      rafId.current = requestAnimationFrame(cursorLoop);
    }

    window.addEventListener("mousemove", onMouseMove);
    rafId.current = requestAnimationFrame(cursorLoop);

    // Hover targets
    const selectors = "a, .lab, .news-card, .category-card, .commission-btn, button";
    function addHover() {
      document.querySelectorAll<HTMLElement>(selectors).forEach((el) => {
        el.addEventListener("mouseenter", () => {
          ring!.classList.add("hover");
          dot!.classList.add("hover", "dot");
        });
        el.addEventListener("mouseleave", () => {
          ring!.classList.remove("hover");
          dot!.classList.remove("hover", "dot");
        });
      });
    }
    addHover();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, [dotRef, ringRef]);
}
