"use client";

import { useEffect, useRef } from "react";

/**
 * useCounter — animated number counter hook
 *
 * Observes a ref element. When it enters viewport at threshold 0.3,
 * animates from 0 to `target` over 2000ms at ~60fps.
 * Returns a ref to attach to the counter element.
 */
export function useCounter(target: number) {
  const elRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            obs.unobserve(entry.target);
            animateCounter(el, target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return elRef;
}

function animateCounter(element: HTMLSpanElement, target: number) {
  let startValue = 0;
  const totalDuration = 2000;
  const frameInterval = 1000 / 60;
  const totalSteps = totalDuration / frameInterval;
  const incrementValue = target / totalSteps;

  const timer = setInterval(() => {
    startValue += incrementValue;
    if (startValue >= target) {
      element.textContent = String(target);
      clearInterval(timer);
    } else {
      element.textContent = String(Math.floor(startValue));
    }
  }, frameInterval);
}
