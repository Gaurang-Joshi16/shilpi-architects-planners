"use client";

import { useEffect, useRef } from "react";

interface LoaderProps {
  onComplete: () => void;
}

export default function Loader({ onComplete }: LoaderProps) {
  const morphRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const morphContainer = morphRef.current;
    const loaderLayer = layerRef.current;
    if (!morphContainer || !loaderLayer) return;

    const t1 = setTimeout(() => {
      // Phase 1: expand suffixes
      morphContainer.classList.add("is-expanded");

      const t2 = setTimeout(() => {
        // Phase 2: collapse back to initials
        morphContainer.classList.remove("is-expanded");

        const t3 = setTimeout(() => {
          // Phase 3: fly to navbar logo position
          const targetNavbarLogo = document.getElementById("target-navbar-logo");
          if (targetNavbarLogo) {
            const destinationRect = targetNavbarLogo.getBoundingClientRect();
            const deltaX =
              destinationRect.left +
              destinationRect.width / 2 -
              window.innerWidth / 2;
            const deltaY =
              destinationRect.top +
              destinationRect.height / 2 -
              window.innerHeight / 2;
            morphContainer.classList.add("is-settling");
            morphContainer.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          } else {
            morphContainer.classList.add("is-settling");
            morphContainer.style.transform = `translate(0px, -45vh)`;
          }

          // Fade out loader layer
          loaderLayer.style.opacity = "0";

          // Signal parent to show main content
          onComplete();

          const t4 = setTimeout(() => {
            // Reveal navbar text
            const actualNavText = document.querySelector(
              ".nav-logo-placeholder"
            ) as HTMLElement | null;
            if (actualNavText) actualNavText.style.opacity = "1";
          }, 950);

          return () => clearTimeout(t4);
        }, 1000);

        return () => clearTimeout(t3);
      }, 2500);

      return () => clearTimeout(t2);
    }, 1000);

    return () => clearTimeout(t1);
  }, [onComplete]);

  return (
    <div className="loader-layer" id="loader-layer" ref={layerRef}>
      <div className="morph-container" id="morph-container" ref={morphRef}>
        <div className="word-block">
          <span className="root-letter">S</span>
          <span className="suffix-letters">hilpi</span>
        </div>
        <div className="word-block">
          <span className="root-letter">A</span>
          <span className="suffix-letters">rchitects</span>
        </div>
        <div className="ampersand-block" id="loader-amp">
          &nbsp;&amp;&nbsp;
        </div>
        <div className="word-block">
          <span className="root-letter">P</span>
          <span className="suffix-letters">lanners</span>
        </div>
      </div>
    </div>
  );
}
