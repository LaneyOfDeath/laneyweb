"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { clsx } from "clsx";
import { Loader2, AlertTriangle } from "lucide-react";

const fetcher = async (url: string) => {
  const r = await fetch(url);
  const d = await r.json();
  if (!r.ok && !d?.needsKey) throw new Error(d?.error ?? `HTTP ${r.status}`);
  return d;
};

export function useApi<T>(url: string | null, refreshMs = 60000) {
  return useSWR<T>(url, fetcher, { refreshInterval: refreshMs, revalidateOnFocus: true });
}

export function Panel({ title, right, children, className }: {
  title?: string; right?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={clsx("rounded-xl border border-[#1a2640] bg-[#0d1e30] p-4", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3 gap-2">
          {title && <p className="text-[11px] font-bold uppercase tracking-widest text-[#6b85a8]">{title}</p>}
          {right}
        </div>
      )}
      {children}
    </div>
  );
}

export function Loading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#4a6080]">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {message}
    </div>
  );
}

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export function Countdown({ to, doneLabel = "Now" }: { to: string | Date; doneLabel?: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return <span className="tabular-nums text-[#4a6080]">--</span>;
  const left = target - now;
  if (left <= 0) return <span className="text-emerald-400 font-bold">{doneLabel}</span>;
  const { d, h, m, s } = parts(left);
  const cell = (v: number, u: string) => (
    <span className="flex flex-col items-center min-w-[2.6rem]">
      <span className="text-2xl font-black text-white tabular-nums leading-none">{String(v).padStart(2, "0")}</span>
      <span className="text-[9px] uppercase tracking-widest text-[#4a6080] mt-1">{u}</span>
    </span>
  );
  return (
    <span className="inline-flex items-end gap-2">
      {cell(d, "days")}{cell(h, "hrs")}{cell(m, "min")}{cell(s, "sec")}
    </span>
  );
}

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) {
  return new Date(iso).toLocaleString("en-GB", { timeZone: "Europe/London", ...opts });
}

export function Updated({ iso }: { iso?: string }) {
  if (!iso) return null;
  return <span className="text-[10px] text-[#4a6080]">Updated {fmtDate(iso, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>;
}
