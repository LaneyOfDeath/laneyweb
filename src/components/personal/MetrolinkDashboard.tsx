"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TramFront, KeyRound } from "lucide-react";
import { useApi, Panel, Loading, ErrorBox, Updated } from "./ui";

interface Tram { dest: string; wait: string; status: string; carriages: string }
interface Stop { name: string; message: string | null; platforms: { id: number; direction: string; line: string; trams: Tram[] }[] }
interface Data { needsKey?: boolean; stops?: Stop[]; updated?: string }

const DEFAULT_STOP = "Failsworth";
const KEY = "laneyweb.metrolink.stop";

export default function MetrolinkDashboard() {
  const { data, error, isLoading } = useApi<Data>("/api/metrolink", 20000);
  const [stop, setStop] = useState(DEFAULT_STOP);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setStop(s); } catch { /* ignore */ }
  }, []);
  const pick = (s: string) => { setStop(s); try { localStorage.setItem(KEY, s); } catch { /* ignore */ } };

  if (isLoading) return <Loading label="Loading trams…" />;
  if (data?.needsKey) {
    return (
      <div className="p-4">
        <Panel title="Needs a free TfGM key">
          <div className="flex items-start gap-3 text-sm text-[#9fb3cc]">
            <KeyRound className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>Live tram times come from Transport for Greater Manchester. Register free at developer.tfgm.com, subscribe to the Open Data product, then add the key to Vercel as <code className="text-amber-300">TFGM_API_KEY</code>.</p>
          </div>
        </Panel>
      </div>
    );
  }
  if (error || !data?.stops) return <div className="p-4"><ErrorBox message={`Tram data unavailable: ${error?.message ?? "unknown"}`} /></div>;

  const current = data.stops.find((s) => s.name === stop) ?? data.stops[0];

  // Merge platforms by direction so each direction shows its next trams in wait order.
  const byDir = new Map<string, Tram[]>();
  for (const p of current?.platforms ?? []) {
    const k = p.direction || "Platform";
    byDir.set(k, [...(byDir.get(k) ?? []), ...p.trams]);
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <Panel right={<Updated iso={data.updated} />}>
        <select value={current?.name} onChange={(e) => pick(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-[#1f3150] bg-[#0a1726] px-3 py-2 text-sm text-white">
          {data.stops.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {[...byDir.entries()].map(([dir, trams]) => {
          const seen = new Set<string>();
          const list = trams
            .filter((t) => { const k = `${t.dest}-${t.wait}`; if (seen.has(k)) return false; seen.add(k); return true; })
            .sort((a, b) => Number(a.wait) - Number(b.wait));
          return (
            <Panel key={dir} title={dir}>
              <div className="space-y-2">
                {list.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0a1726] border border-[#13243a] px-3 py-2"
                    style={{ fontFamily: "monospace" }}>
                    <TramFront className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-yellow-300 truncate">{t.dest}</span>
                    <span className="text-[10px] text-[#4a6080]">{t.carriages === "Double" ? "double" : ""}</span>
                    <span className={clsx("text-sm font-bold tabular-nums w-14 text-right", t.wait === "0" ? "text-emerald-400" : "text-yellow-300")}>
                      {t.status === "Arrived" || t.wait === "0" ? "Due" : `${t.wait} min`}
                    </span>
                  </div>
                ))}
                {!list.length && <p className="text-xs text-[#4a6080]">No trams shown.</p>}
              </div>
            </Panel>
          );
        })}
      </div>

      {current?.message && (
        <Panel title="Stop message"><p className="text-xs text-[#9fb3cc]">{current.message}</p></Panel>
      )}
    </div>
  );
}
