"use client";

import { clsx } from "clsx";
import { useApi, Panel, Loading, ErrorBox, Countdown, fmtDate, Updated } from "./ui";

interface Side { name: string; short: string; logo: string | null; score: string | null }
interface Match { id: string; date: string; comp: string | null; state: string; detail: string; clock: string | null; venue: string | null; home: Side; away: Side }
interface Row { rank: number; team: string; short: string; logo: string | null; played: number; won: number; drawn: number; lost: number; gd: number; points: number; mine: boolean }
interface City { live: Match | null; next: Match | null; upcoming: Match[]; results: Match[]; table: Row[]; updated: string }

const CITY = "MNC";

function Crest({ s, big }: { s: Side; big?: boolean }) {
  return s.logo
    // eslint-disable-next-line @next/next/no-img-element
    ? <img src={s.logo} alt="" className={big ? "w-12 h-12" : "w-5 h-5"} />
    : <span className={clsx("rounded-full bg-[#1f3150]", big ? "w-12 h-12" : "w-5 h-5")} />;
}

function outcome(m: Match) {
  const cityHome = m.home.short === CITY;
  const us = Number(cityHome ? m.home.score : m.away.score);
  const them = Number(cityHome ? m.away.score : m.home.score);
  if (Number.isNaN(us) || Number.isNaN(them)) return null;
  return us > them ? "W" : us < them ? "L" : "D";
}

function BigMatch({ m, live }: { m: Match; live?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex flex-col items-center gap-1 flex-1 text-center">
        <Crest s={m.home} big />
        <span className="text-sm font-semibold text-white">{m.home.name}</span>
      </div>
      <div className="flex flex-col items-center">
        {live ? (
          <>
            <span className="text-4xl font-black text-white tabular-nums">{m.home.score} – {m.away.score}</span>
            <span className="text-xs font-bold text-red-400 animate-pulse">{m.clock ?? m.detail}</span>
          </>
        ) : (
          <>
            <Countdown to={m.date} doneLabel="Kick-off" />
            <span className="text-[11px] text-[#4a6080] mt-1">{fmtDate(m.date)}</span>
          </>
        )}
      </div>
      <div className="flex flex-col items-center gap-1 flex-1 text-center">
        <Crest s={m.away} big />
        <span className="text-sm font-semibold text-white">{m.away.name}</span>
      </div>
    </div>
  );
}

export default function CityDashboard() {
  const { data, error, isLoading } = useApi<City>("/api/city", 30000);
  if (isLoading) return <Loading label="Loading City…" />;
  if (error || !data) return <div className="p-4"><ErrorBox message={`Match data unavailable: ${error?.message ?? "unknown"}`} /></div>;

  const mineIdx = data.table.findIndex((r) => r.mine);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {data.live ? (
        <Panel title="Live now" right={<Updated iso={data.updated} />}><BigMatch m={data.live} live /></Panel>
      ) : data.next ? (
        <Panel title={`Next match · ${data.next.venue ?? ""}`} right={<Updated iso={data.updated} />}><BigMatch m={data.next} /></Panel>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Panel title="Recent results">
            <div className="space-y-1.5">
              {data.results.map((m) => {
                const o = outcome(m);
                return (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    <span className={clsx("w-5 h-5 rounded text-[10px] font-black flex items-center justify-center",
                      o === "W" ? "bg-emerald-500/20 text-emerald-300" : o === "L" ? "bg-red-500/20 text-red-300" : "bg-[#1f3150] text-white")}>{o ?? "–"}</span>
                    <span className="text-[#4a6080] w-16">{fmtDate(m.date, { day: "numeric", month: "short" })}</span>
                    <span className="flex-1 truncate text-right">{m.home.name}</span>
                    <span className="font-bold tabular-nums text-white">{m.home.score}–{m.away.score}</span>
                    <span className="flex-1 truncate">{m.away.name}</span>
                  </div>
                );
              })}
              {!data.results.length && <p className="text-xs text-[#4a6080]">No results yet.</p>}
            </div>
          </Panel>
          <Panel title="Coming up">
            <div className="space-y-1.5">
              {data.upcoming.map((m) => (
                <div key={m.id} className="flex items-center gap-2 text-xs">
                  <span className="text-[#4a6080] w-28">{fmtDate(m.date, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <Crest s={m.home.short === CITY ? m.away : m.home} />
                  <span className="flex-1 truncate">{m.home.short === CITY ? `${m.away.name} (H)` : `${m.home.name} (A)`}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Premier League table">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[#4a6080] text-[10px] uppercase">
                <th className="text-left pb-1">#</th><th className="text-left pb-1">Team</th>
                <th className="text-right pb-1">P</th><th className="text-right pb-1">GD</th><th className="text-right pb-1">Pts</th>
              </tr>
            </thead>
            <tbody>
              {data.table.map((r, i) => (
                <tr key={r.short} className={clsx("border-t border-[#13243a]",
                  r.mine && "text-sky-300 font-bold bg-sky-400/5",
                  Math.abs(i - mineIdx) > 3 && i > 3 && i < data.table.length - 3 && "opacity-50")}>
                  <td className="py-1 tabular-nums">{r.rank}</td>
                  <td className="py-1 truncate max-w-[10rem]">{r.team}</td>
                  <td className="py-1 text-right tabular-nums">{r.played}</td>
                  <td className="py-1 text-right tabular-nums">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                  <td className="py-1 text-right tabular-nums font-bold">{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}
