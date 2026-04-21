"use client";

import { useState, useRef, useCallback } from "react";
import { Play, RefreshCw } from "lucide-react";

type Phase = "idle" | "ping" | "download" | "upload" | "done";

interface Results {
  ping: number | null;
  download: number | null;
  upload: number | null;
}

// SVG gauge constants
const R = 80;
const CX = 100;
const CY = 105;
const CIRC = 2 * Math.PI * R;        // 502.65
const ARC = CIRC * (240 / 360);      // 335.10  (240° sweep)
const GAP = CIRC - ARC;              // 167.55
const ROTATE = 150;                  // start from bottom-left (7 o'clock)

function arcFill(value: number, max: number) {
  return Math.min(ARC, (value / max) * ARC);
}

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  active: boolean;
}

function Gauge({ value, max, label, unit, color, active }: GaugeProps) {
  const filled = arcFill(value, max);
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 140" className="w-64 sm:w-72">
        {/* Track */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="#1e2a3a"
          strokeWidth="14"
          strokeDasharray={`${ARC} ${GAP}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATE} ${CX} ${CY})`}
        />
        {/* Fill */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={active ? color : "#2d3748"}
          strokeWidth="14"
          strokeDasharray={`${filled} ${CIRC - filled}`}
          strokeLinecap="round"
          transform={`rotate(${ROTATE} ${CX} ${CY})`}
          style={{ transition: "stroke-dasharray 0.15s ease-out, stroke 0.3s" }}
        />
        {/* Value */}
        <text x={CX} y={CY - 6} textAnchor="middle" className="font-mono" fill="white"
          fontSize="28" fontWeight="900" fontFamily="monospace">
          {value >= 1000 ? (value / 1000).toFixed(1) + "k" : value < 10 ? value.toFixed(1) : Math.round(value)}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="monospace">
          {unit}
        </text>
        <text x={CX} y={CY + 34} textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="sans-serif">
          {label}
        </text>
      </svg>
    </div>
  );
}

function ResultPill({ label, value, unit, color }: { label: string; value: number | null; unit: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-[#1e2a3a] bg-[#111827] px-6 py-4 min-w-[110px]">
      <span className="text-[10px] text-[#64748b] uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-black tabular-nums ${value != null ? color : "text-[#2d3748]"}`}>
        {value != null ? (value < 10 ? value.toFixed(1) : Math.round(value)) : "—"}
      </span>
      <span className="text-[10px] text-[#64748b]">{unit}</span>
    </div>
  );
}

const PHASES: Phase[] = ["ping", "download", "upload"];
const PHASE_LABELS: Record<Phase, string> = {
  idle: "Ready",
  ping: "Testing latency…",
  download: "Testing download…",
  upload: "Testing upload…",
  done: "Test complete",
};
const PHASE_GAUGE: Record<Phase, { label: string; unit: string; max: number; color: string }> = {
  idle:     { label: "Speed", unit: "Mbps", max: 500, color: "#00f5ff" },
  ping:     { label: "Latency", unit: "ms", max: 300, color: "#a78bfa" },
  download: { label: "Download", unit: "Mbps", max: 500, color: "#00f5ff" },
  upload:   { label: "Upload", unit: "Mbps", max: 200, color: "#ff006e" },
  done:     { label: "Speed", unit: "Mbps", max: 500, color: "#00f5ff" },
};

export default function SpeedDashboard() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [gaugeVal, setGaugeVal] = useState(0);
  const [gaugeMax, setGaugeMax] = useState(100);
  const [results, setResults] = useState<Results>({ ping: null, download: null, upload: null });
  const acRef = useRef<AbortController | null>(null);

  const bump = (mbps: number) => {
    setGaugeVal(mbps);
    setGaugeMax((m) => (mbps > m * 0.75 ? Math.min(m * 2, 2000) : m));
  };

  const runTest = useCallback(async () => {
    if (acRef.current) return;
    setResults({ ping: null, download: null, upload: null });

    // ── Ping ─────────────────────────────────────────────────────────
    setPhase("ping");
    setGaugeVal(0);
    setGaugeMax(300);
    const pings: number[] = [];
    for (let i = 0; i < 10; i++) {
      const t0 = performance.now();
      await fetch("/api/speed/ping", { cache: "no-store" });
      pings.push(performance.now() - t0);
      setGaugeVal(pings[pings.length - 1]);
      await new Promise((r) => setTimeout(r, 60));
    }
    const pingMs = Math.round(pings.slice(2).reduce((a, b) => a + b) / (pings.length - 2));
    setResults((r) => ({ ...r, ping: pingMs }));

    // ── Download — 6 parallel streams for 8 s ────────────────────────
    setPhase("download");
    setGaugeVal(0);
    setGaugeMax(100);
    {
      const ac = new AbortController();
      acRef.current = ac;
      const t0 = performance.now();
      let totalBytes = 0;
      const workers = Array.from({ length: 6 }, async () => {
        while (!ac.signal.aborted) {
          try {
            const res = await fetch("/api/speed/download", { cache: "no-store", signal: ac.signal });
            const reader = res.body!.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              totalBytes += value.length;
              bump((totalBytes * 8) / ((performance.now() - t0) / 1000 * 1_000_000));
            }
          } catch { break; }
        }
      });
      setTimeout(() => ac.abort(), 8000);
      await Promise.allSettled(workers);
      const dl = (totalBytes * 8) / (Math.min(performance.now() - t0, 8000) / 1000 * 1_000_000);
      setResults((r) => ({ ...r, download: dl }));
      acRef.current = null;
    }

    // ── Upload — 4 parallel streams for 6 s ─────────────────────────
    setPhase("upload");
    setGaugeVal(0);
    setGaugeMax(100);
    {
      const ac = new AbortController();
      acRef.current = ac;
      const t0 = performance.now();
      let totalBytes = 0;
      const chunk = new Uint8Array(1024 * 1024); // 1 MB
      const workers = Array.from({ length: 4 }, async () => {
        while (!ac.signal.aborted) {
          try {
            await fetch("/api/speed/upload", { method: "POST", body: chunk, cache: "no-store", signal: ac.signal });
            totalBytes += chunk.length;
            bump((totalBytes * 8) / ((performance.now() - t0) / 1000 * 1_000_000));
          } catch { break; }
        }
      });
      setTimeout(() => ac.abort(), 6000);
      await Promise.allSettled(workers);
      const ul = (totalBytes * 8) / (Math.min(performance.now() - t0, 6000) / 1000 * 1_000_000);
      setResults((r) => ({ ...r, upload: ul }));
      acRef.current = null;
    }

    setPhase("done");
  }, []);

  const reset = useCallback(() => {
    acRef.current?.abort();
    setPhase("idle");
    setGaugeVal(0);
    setGaugeMax(100);
    setResults({ ping: null, download: null, upload: null });
  }, []);

  const gauge = PHASE_GAUGE[phase];
  const isRunning = phase !== "idle" && phase !== "done";

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 gap-8">
      {/* Gauge */}
      <div className="flex flex-col items-center gap-2">
        <Gauge
          value={gaugeVal}
          max={gaugeMax}
          label={gauge.label}
          unit={gauge.unit}
          color={gauge.color}
          active={isRunning}
        />
        <p className={`text-sm font-medium ${isRunning ? "text-[#94a3b8] animate-pulse" : "text-[#64748b]"}`}>
          {PHASE_LABELS[phase]}
        </p>
      </div>

      {/* Results */}
      <div className="flex gap-3 flex-wrap justify-center">
        <ResultPill label="Ping" value={results.ping} unit="ms" color="text-violet-400" />
        <ResultPill label="Download" value={results.download} unit="Mbps" color="text-cyan-400" />
        <ResultPill label="Upload" value={results.upload} unit="Mbps" color="text-pink-400" />
      </div>

      {/* Button */}
      {phase === "idle" && (
        <button
          onClick={runTest}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-cyan-500/20 border border-cyan-500/40
                     text-cyan-400 font-semibold text-sm hover:bg-cyan-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4 fill-current" />
          Start Test
        </button>
      )}
      {phase === "done" && (
        <button
          onClick={reset}
          className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-[#1e2a3a]
                     text-[#94a3b8] font-semibold text-sm hover:bg-white/10 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Test Again
        </button>
      )}
      {isRunning && (
        <div className="flex gap-1.5">
          {PHASES.map((p) => (
            <div key={p} className={`h-1 rounded-full transition-all duration-300 ${
              p === phase ? "w-8 bg-cyan-400" :
              PHASES.indexOf(p) < PHASES.indexOf(phase) ? "w-4 bg-cyan-600" :
              "w-4 bg-[#1e2a3a]"
            }`} />
          ))}
        </div>
      )}

      <p className="text-[10px] text-[#64748b] text-center max-w-sm">
        Measures connection to Vercel edge · Results reflect your ISP speed to the nearest edge node
      </p>
    </div>
  );
}
