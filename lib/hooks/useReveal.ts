"use client";

import { useEffect } from "react";

/**
 * useReveal — IntersectionObserver scroll reveal hook
 *
 * Observes all [data-reveal] elements and adds class "in"
 * when they intersect at threshold 0.12.
 * Unobserves after triggering (one-shot).
 */
export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);
}
