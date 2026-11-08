"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { useApi, Panel, Loading, ErrorBox, Countdown, fmtDate, Updated } from "./ui";

interface Game { id: string; title: string; image: string | null }
interface Deal { title: string; sale: number; normal: number; savings: number; thumb: string; url: string }
interface Drops { coming: Game[]; added: Game[]; leaving: Game[]; steam: Deal[]; updated: string }

// Hand-kept release list. Dates verified 4 Nov 2026 (Xbox pre-load + launch).
const RELEASES = [
  { title: "GTA 6 pre-load (Xbox)", at: "2026-11-10T00:00:00Z", note: "Up to 212 GB, check free space" },
  { title: "Grand Theft Auto VI", at: "2026-11-19T00:00:00Z", note: "Launch day" },
];

const TABS = [
  { key: "coming", label: "Coming to Game Pass" },
  { key: "added", label: "Recently added" },
  { key: "leaving", label: "Leaving soon" },
] as const;

export default function DropsDashboard() {
  const { data, error, isLoading } = useApi<Drops>("/api/drops", 30 * 60000);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("coming");
  const upcoming = RELEASES.filter((r) => new Date(r.at).getTime() > Date.now() - 86400000);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {upcoming.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {upcoming.map((r) => (
            <Panel key={r.title} title={r.title}>
              <Countdown to={r.at} doneLabel="Out now" />
              <p className="text-[11px] text-[#4a6080] mt-1">{fmtDate(r.at)} · {r.note}</p>
            </Panel>
          ))}
        </div>
      )}

      {isLoading && <Loading label="Loading Game Pass…" />}
      {error && <ErrorBox message={`Game data unavailable: ${error.message}`} />}

      {data && (
        <>
          <Panel
            right={<Updated iso={data.updated} />}
            title="Xbox Game Pass">
            <div className="flex gap-1 mb-3 flex-wrap">
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={clsx("rounded-lg px-3 py-1 text-xs font-semibold",
                    tab === t.key ? "bg-emerald-500/20 text-emerald-300" : "text-[#4a6080] hover:text-white")}>
                  {t.label} ({data[t.key].length})
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
              {data[tab].map((g) => (
                <a key={g.id} href={`https://www.xbox.com/en-GB/games/store/x/${g.id}`} target="_blank" rel="noreferrer"
                  className="group flex flex-col gap-1">
                  {g.image
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={g.image} alt="" loading="lazy" className="w-full aspect-[2/3] object-cover rounded-lg border border-[#1a2640] group-hover:border-emerald-500/50" />
                    : <div className="w-full aspect-[2/3] rounded-lg bg-[#0a1726]" />}
                  <span className="text-[11px] text-[#c5d3e6] leading-tight line-clamp-2">{g.title}</span>
                </a>
              ))}
            </div>
          </Panel>

          <Panel title="Best Steam deals right now (US prices)">
            <div className="grid gap-2 md:grid-cols-2">
              {data.steam.map((d) => (
                <a key={d.url} href={d.url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-[#13243a] bg-[#0a1726] p-2 hover:border-[#243352]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.thumb} alt="" className="w-20 h-8 object-cover rounded" loading="lazy" />
                  <span className="flex-1 text-xs text-white truncate">{d.title}</span>
                  <span className="text-[11px] font-black text-emerald-300">−{d.savings}%</span>
                  <span className="text-[11px] text-[#4a6080] line-through">${d.normal.toFixed(2)}</span>
                  <span className="text-xs font-bold text-white">${d.sale.toFixed(2)}</span>
                </a>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
