"use client";

import { useEffect, useState } from "react";

// Starts at the server-rendered clock (no hydration mismatch) and advances in real
// time from there. The server clock may be simulated (demo data), so keep the offset.
export function useNow(initial: number, intervalMs = 15_000) {
  const [now, setNow] = useState(initial);
  useEffect(() => {
    const offset = initial - Date.now();
    const id = setInterval(() => setNow(Date.now() + offset), intervalMs);
    return () => clearInterval(id);
  }, [initial, intervalMs]);
  return now;
}
