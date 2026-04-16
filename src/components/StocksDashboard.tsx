"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Activity } from "lucide-react";
import { clsx } from "clsx";

interface Quote {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  type: "index" | "stock" | "crypto";
}

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function QuoteCard({ q }: { q: Quote }) {
  const positive = q.change >= 0;
  return (
    <div
      className={clsx(
        "rounded-xl border bg-[#111827] p-4 flex flex-col gap-2",
        positive ? "border-emerald-500/20" : "border-red-500/20"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-white">{q.symbol}</p>
          <p className="text-[11px] text-[#64748b] truncate max-w-[140px]">{q.name}</p>
        </div>
        <span
          className={clsx(
            "text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase",
            q.type === "index" && "bg-blue-500/20 text-blue-400",
            q.type === "stock" && "bg-cyan-500/20 text-cyan-400",
            q.type === "crypto" && "bg-orange-500/20 text-orange-400"
          )}
        >
          {q.type}
        </span>
      </div>
      <p className="text-xl font-bold text-white tabular-nums">
        {q.currency === "USD" ? "$" : ""}{fmt(q.price, q.price > 100 ? 2 : 4)}
        {q.currency !== "USD" && <span className="text-xs text-[#64748b] ml-1">{q.currency}</span>}
      </p>
      <div className={clsx("flex items-center gap-1.5 text-sm font-semibold", positive ? "text-emerald-400" : "text-red-400")}>
        {positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span>{positive ? "+" : ""}{fmt(q.change)}</span>
        <span className="text-xs">({positive ? "+" : ""}{fmt(q.changePercent)}%)</span>
      </div>
      {q.marketState && (
        <p className={clsx("text-[10px]", q.marketState === "REGULAR" ? "text-emerald-400" : "text-[#64748b]")}>
          {q.marketState === "REGULAR" ? "Market open" : q.marketState === "PRE" ? "Pre-market" : "After hours"}
        </p>
      )}
    </div>
  );
}

export default function StocksDashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "index" | "stock" | "crypto">("all");

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/stocks");
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setQuotes(json.quotes ?? []);
      setLastUpdate(new Date());
    } catch {
      setError("Market data unavailable. Retrying…");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = filter === "all" ? quotes : quotes.filter((q) => q.type === filter);
  const indices = quotes.filter((q) => q.type === "index");

  return (
    <div className="p-6 space-y-6">
      {/* Ticker tape */}
      {indices.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#1e2a3a] bg-[#0d1224] py-2">
          <div
            className="flex gap-8 whitespace-nowrap ticker-inner"
            style={{ width: "200%" }}
          >
            {[...indices, ...indices].map((q, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm">
                <span className="font-bold text-white">{q.symbol}</span>
                <span className="text-white">{fmt(q.price)}</span>
                <span className={q.change >= 0 ? "text-emerald-400" : "text-red-400"}>
                  {q.change >= 0 ? "+" : ""}{fmt(q.changePercent)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5">
          {(["all", "index", "stock", "crypto"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-[#111827] border border-[#1e2a3a] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((q) => (
            <QuoteCard key={q.symbol} q={q} />
          ))}
        </div>
      )}

      <p className="text-xs text-[#64748b]">
        Data via Yahoo Finance · 60s refresh · For informational purposes only
      </p>
    </div>
  );
}
