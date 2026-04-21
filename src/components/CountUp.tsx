"use client";
import { useCountUp } from "@/hooks/useCountUp";

interface CountUpProps {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export default function CountUp({ end, decimals = 0, prefix = "", suffix = "", duration = 1200 }: CountUpProps) {
  const count = useCountUp(end, duration, decimals);
  const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();
  return <>{prefix}{display}{suffix}</>;
}
