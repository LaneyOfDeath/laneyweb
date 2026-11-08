"use client";

import { clsx } from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useApi, Panel, Loading, ErrorBox, Countdown, fmtDate, Updated } from "./ui";

interface Player {
  id: number; name: string; team: string; pos: string; starting: boolean; captain: boolean; vice: boolean;
  multiplier: number; points: number; minutes: number; news: string | null; chance: number | null;
}
interface Fpl {
  gw: number; gwName: string; gwFinished: boolean;
  next: { id: number; name: string; deadline: string } | null;
  team: { name: string; overallPoints: number; overallRank: number; gwPoints: number; liveTotal: number; bank: number; value: number; transferCost: number; activeChip: string | null };
  squad: Player[];
  chipsUsed: { name: string; gw: number }[];
  league: { name: string; rows: { rank: number; lastRank: number; team: string; manager: string; gw: number; total: number; mine: boolean }[] } | null;
  updated: string;
}

// Plan agreed 6 Nov 2026. First-half chips expire after GW19.
const CHIP_PLAN = [
  { chip: "wildcard", label: "Wildcard", gw: 11, note: "Rebuild after the international break" },
  { chip: "bboost", label: "Bench Boost", gw: 12, note: "GW12 or 13, strong bench straight after the wildcard" },
  { chip: "3xc", label: "Triple Captain", gw: 16, note: "Haaland v Hull at home" },
  { chip: "freehit", label: "Free Hit", gw: 19, note: "By GW19 at the latest, earlier if injuries pile up" },
];

const POS_ORDER = ["GKP", "DEF", "MID", "FWD"];

function PlayerChip({ p }: { p: Player }) {
  const doubt = p.chance !== null && p.chance < 100;
  return (
    <div className={clsx(
      "relative flex flex-col items-center rounded-lg border px-2 py-1.5 min-w-[5.5rem]",
      p.captain ? "border-amber-400/50 bg-amber-400/10" : "border-[#1f3150] bg-[#0a1726]"
    )}>
      {(p.captain || p.vice) && (
        <span className={clsx("absolute -top-2 -right-2 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center",
          p.captain ? "bg-amber-400 text-black" : "bg-[#1f3150] text-white")}>
          {p.captain ? "C" : "V"}
        </span>
      )}
      <span className={clsx("text-[11px] font-semibold truncate max-w-[6rem]", doubt ? "text-orange-300" : "text-white")} title={p.news ?? undefined}>
        {p.name}
      </span>
      <span className="text-[9px] text-[#4a6080]">{p.team} · {p.pos}</span>
      <span className="text-sm font-black text-cyan-300 tabular-nums">{p.points * Math.max(p.multiplier, 1)}</span>
    </div>
  );
}

export default function FplDashboard() {
  const { data, error, isLoading } = useApi<Fpl>("/api/fpl", 60000);
  if (isLoading) return <Loading label="Loading Claude's XI…" />;
  if (error || !data) return <div className="p-4"><ErrorBox message={`FPL data unavailable: ${error?.message ?? "unknown"}`} /></div>;

  const starters = data.squad.filter((p) => p.starting);
  const bench = data.squad.filter((p) => !p.starting);
  const used = new Set(data.chipsUsed.map((c) => c.name));
  const flagged = data.squad.filter((p) => p.chance !== null && p.chance < 100);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Panel title={data.gwName}>
          <p className="text-3xl font-black text-white tabular-nums">{data.team.liveTotal}</p>
          <p className="text-[11px] text-[#4a6080]">{data.gwFinished ? "final" : "live"} points{data.team.transferCost ? ` (−${data.team.transferCost} hit)` : ""}</p>
        </Panel>
        <Panel title="Season">
          <p className="text-3xl font-black text-white tabular-nums">{data.team.overallPoints}</p>
          <p className="text-[11px] text-[#4a6080]">rank {data.team.overallRank?.toLocaleString("en-GB")}</p>
        </Panel>
        <Panel title="Money">
          <p className="text-3xl font-black text-white tabular-nums">£{data.team.bank.toFixed(1)}m</p>
          <p className="text-[11px] text-[#4a6080]">in the bank · squad £{data.team.value.toFixed(1)}m</p>
        </Panel>
        <Panel title={data.next ? `${data.next.name} deadline` : "Next deadline"}>
          {data.next ? (
            <>
              <Countdown to={data.next.deadline} doneLabel="Deadline passed" />
              <p className="text-[11px] text-[#4a6080] mt-1">{fmtDate(data.next.deadline)}</p>
            </>
          ) : <p className="text-sm text-[#4a6080]">Season over</p>}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title={`${data.team.name} · ${data.gwName}`} right={<Updated iso={data.updated} />}>
          <div className="space-y-3">
            {POS_ORDER.map((pos) => (
              <div key={pos} className="flex flex-wrap justify-center gap-2">
                {starters.filter((p) => p.pos === pos).map((p) => <PlayerChip key={p.id} p={p} />)}
              </div>
            ))}
            <div className="border-t border-[#1a2640] pt-3">
              <p className="text-[10px] uppercase tracking-widest text-[#4a6080] text-center mb-2">Bench</p>
              <div className="flex flex-wrap justify-center gap-2 opacity-70">
                {bench.map((p) => <PlayerChip key={p.id} p={p} />)}
              </div>
            </div>
            {flagged.length > 0 && (
              <div className="border-t border-[#1a2640] pt-3 space-y-1">
                {flagged.map((p) => (
                  <p key={p.id} className="text-[11px] text-orange-300">
                    <b>{p.name}</b> {p.chance}%: {p.news}
                  </p>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <div className="space-y-4">
          {data.league && (
            <Panel title={data.league.name}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#4a6080] text-[10px] uppercase">
                    <th className="text-left pb-1">#</th><th className="text-left pb-1">Team</th>
                    <th className="text-right pb-1">GW</th><th className="text-right pb-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.league.rows.map((r) => (
                    <tr key={r.team} className={clsx("border-t border-[#13243a]", r.mine && "text-cyan-300 font-bold")}>
                      <td className="py-1 pr-1 tabular-nums">
                        <span className="inline-flex items-center gap-0.5">
                          {r.rank}
                          {r.lastRank > r.rank && <ArrowUp className="w-3 h-3 text-emerald-400" />}
                          {r.lastRank < r.rank && r.lastRank > 0 && <ArrowDown className="w-3 h-3 text-red-400" />}
                        </span>
                      </td>
                      <td className="py-1 truncate max-w-[10rem]">{r.team}<span className="block text-[10px] text-[#4a6080] font-normal">{r.manager}</span></td>
                      <td className="py-1 text-right tabular-nums">{r.gw}</td>
                      <td className="py-1 text-right tabular-nums">{r.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          <Panel title="Chip plan">
            <div className="space-y-2">
              {CHIP_PLAN.map((c) => {
                const done = used.has(c.chip);
                return (
                  <div key={c.chip} className="flex items-start gap-3">
                    <span className={clsx("mt-0.5 text-[10px] font-black rounded px-1.5 py-0.5 tabular-nums",
                      done ? "bg-emerald-500/20 text-emerald-300" : "bg-[#1f3150] text-white")}>
                      GW{c.gw}
                    </span>
                    <div>
                      <p className={clsx("text-xs font-semibold", done ? "text-emerald-300 line-through" : "text-white")}>{c.label}</p>
                      <p className="text-[11px] text-[#4a6080]">{done ? "Used" : c.note}</p>
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-[#4a6080] pt-1">First-half chips are lost if not used by GW19 (1 Jan 2027).</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
