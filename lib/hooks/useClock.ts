"use client";

import { useEffect, useState } from "react";

/**
 * useClock — IST live clock hook
 * Updates every 15 seconds.
 * Returns a string like "14:32 IST".
 */
export function useClock(): string {
  const [time, setTime] = useState<string>("— : — IST");

  useEffect(() => {
    function tick() {
      const d = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const t = new Intl.DateTimeFormat("en-GB", opts).format(d);
      setTime(t + " IST");
    }
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, []);

  return time;
}
