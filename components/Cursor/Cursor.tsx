"use client";

import { useRef } from "react";
import { useCursor } from "@/lib/hooks/useCursor";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useCursor(dotRef, ringRef);

  return (
    <>
      <div className="cursor" id="cur" ref={dotRef} />
      <div className="cursor ring" id="curRing" ref={ringRef} />
    </>
  );
}
