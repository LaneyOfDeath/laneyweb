"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Shield, Wifi, Globe, Server } from "lucide-react";
import CountUp from "@/components/CountUp";

interface TorData {
  summary: { relays: number; bridges: number } | null;
  bandwidth: { readGbps: string | null; writeGbps: string | null; date: string | null; trend: string | null } | null;
  byCountry: { country: string; count: number }[];
  topRelays: { nickname: string; country: string; bandwidthMbps: string; flags: string[]; weight: number }[];
  timestamp: number;
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[11px] text-[#64748b] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-[10px] text-[#64748b] mt-1">{sub}</p>}
    </div>
  );
}

export default function TorDashboard() {
  const [data, setData] = useState<TorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tor");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const maxCount = data?.byCountry[0]?.count ?? 1;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2a3a]">
        <p className="text-xs text-[#64748b]">Tor network statistics — public data, no Tor browser required</p>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!data ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-6 h-6 text-[#64748b] animate-spin" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-4 px-4 space-y-5">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Relays" value={data.summary?.relays ?? "—"} sub="Active nodes" icon={Server} color="text-purple-400" />
              <StatCard label="Bridges" value={data.summary?.bridges ?? "—"} sub="Hidden relays" icon={Shield} color="text-violet-400" />
              <StatCard label="Bandwidth In" value={data.bandwidth?.readGbps ? `${data.bandwidth.readGbps} Gbps` : "—"} sub={data.bandwidth?.date ?? ""} icon={Wifi} color="text-cyan-400" />
              <StatCard label="Bandwidth Out" value={data.bandwidth?.writeGbps ? `${data.bandwidth.writeGbps} Gbps` : "—"} sub="Outbound traffic" icon={Wifi} color="text-blue-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Relays by country */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2a3a]">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">Relays by Country</span>
                </div>
                <div className="p-4 space-y-2">
                  {data.byCountry.map(({ country, count }) => (
                    <div key={country} className="flex items-center gap-3">
                      <span className="text-xs text-[#94a3b8] w-8 font-mono">{country}</span>
                      <div className="flex-1 h-1.5 bg-[#1e2a3a] rounded-full overflow-hidden">
                        <div
                          className="h-1.5 bg-purple-400 rounded-full transition-all duration-500"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#64748b] w-10 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top relays */}
              <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2a3a]">
                  <Server className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">Top Relays by Weight</span>
                </div>
                <div className="divide-y divide-[#1e2a3a]/50">
                  {data.topRelays.map((r, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-white/5">
                      <span className="text-[10px] text-[#4a5568] w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{r.nickname}</p>
                        <p className="text-[10px] text-[#64748b]">{r.country} · {r.bandwidthMbps} Mbps</p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {(r.flags ?? []).slice(0, 2).map((f: string) => (
                          <span key={f} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/20">{f}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[#64748b] text-center pb-2">
              Source: Tor Project Metrics · metrics.torproject.org · onionoo.torproject.org · No key required
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
