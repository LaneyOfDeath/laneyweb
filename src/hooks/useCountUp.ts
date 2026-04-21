"use client";
import { useEffect, useState } from "react";

export function useCountUp(end: number, duration = 1200, decimals = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!end) { setCount(end); return; }
    const steps = Math.max(30, Math.round(duration / 16));
    const increment = end / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      current = eased * end;
      if (step >= steps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(parseFloat(current.toFixed(decimals)));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end, duration, decimals]);

  return count;
}
