"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { TramFront, AlertTriangle } from "lucide-react";
import { useApi, Panel, Loading, ErrorBox, Updated } from "./ui";
import { STOPS } from "./metrolinkStops";

interface Tram { dest: string; carriages: string | null; wait: number | null; status: string | null }
interface Data { stop: string; trams: Tram[]; alerts: { title: string; text: string | null }[]; updated: string }

const KEY = "laneyweb.metrolink.stop";

export default function MetrolinkDashboard() {
  const [stop, setStop] = useState("failsworth-tram");
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restore saved stop after hydration
      if (s && STOPS.some((x) => x.slug === s)) setStop(s);
    } catch { /* ignore */ }
  }, []);
  const pick = (s: string) => { setStop(s); try { localStorage.setItem(KEY, s); } catch { /* ignore */ } };

  const { data, error, isLoading } = useApi<Data>(`/api/metrolink?stop=${stop}`, 30000);

  // Group by destination, soonest first.
  const groups = new Map<string, Tram[]>();
  for (const t of data?.trams ?? []) groups.set(t.dest, [...(groups.get(t.dest) ?? []), t]);
  const ordered = [...groups.entries()].sort((a, b) => (a[1][0].wait ?? 99) - (b[1][0].wait ?? 99));

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl">
      <Panel right={data && <Updated iso={data.updated} />}>
        <select value={stop} onChange={(e) => pick(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-[#1f3150] bg-[#0a1726] px-3 py-2 text-sm text-white">
          {STOPS.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </Panel>

      {isLoading && <Loading label="Loading trams…" />}
      {error && <ErrorBox message={`Tram times unavailable: ${error.message}`} />}

      {data && (
        <div className="grid gap-4 md:grid-cols-2">
          {ordered.map(([dest, trams]) => (
            <Panel key={dest} title={`To ${dest}`}>
              <div className="space-y-2">
                {trams.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-[#0a1726] border border-[#13243a] px-3 py-2"
                    style={{ fontFamily: "monospace" }}>
                    <TramFront className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                    <span className="flex-1 text-sm text-yellow-300 truncate">{dest}</span>
                    <span className="text-[10px] text-[#4a6080]">{t.carriages === "Double" ? "double" : ""}</span>
                    <span className={clsx("text-sm font-bold tabular-nums w-16 text-right", !t.wait ? "text-emerald-400" : "text-yellow-300")}>
                      {t.status === "Arrived" ? "Here" : !t.wait ? "Due" : `${t.wait} min`}
                    </span>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
          {!ordered.length && <Panel><p className="text-xs text-[#4a6080]">No trams shown for this stop right now.</p></Panel>}
        </div>
      )}

      {data && data.alerts.length > 0 && (
        <Panel title="Disruptions">
          <div className="space-y-3">
            {data.alerts.map((a, i) => (
              <div key={i} className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">{a.title}</p>
                  {a.text && <p className="text-[11px] text-[#9fb3cc]">{a.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
      <p className="text-[10px] text-[#4a6080]">Times from tfgm.com live departures.</p>
    </div>
  );
}
