"use client";
import { useEffect, useRef, useState } from "react";

export function useCountUp(end: number, duration = 1200, decimals = 0) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>();
  const startRef = useRef<number>();

  useEffect(() => {
    if (isNaN(end) || end === 0) { setCount(end); return; }
    startRef.current = undefined;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * end).toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [end, duration, decimals]);

  return count;
}
