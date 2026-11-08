import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API = "https://fantasy.premierleague.com/api";
const ENTRY = 1996884;   // Claude's XI
const LEAGUE = 40744;    // Fantasy Warehouse
const HDR = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

async function get<T>(path: string, revalidate = 0): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    headers: HDR,
    ...(revalidate ? { next: { revalidate } } : { cache: "no-store" as const }),
  });
  if (!r.ok) throw new Error(`FPL ${path} -> ${r.status}`);
  return r.json();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function GET() {
  try {
    const boot = await get<any>("/bootstrap-static/", 600);
    const events: any[] = boot.events;
    const current = events.find((e) => e.is_current) ?? events.find((e) => e.is_previous);
    const next = events.find((e) => e.is_next);
    const gw: number = current?.id ?? 1;

    const [entry, picks, live, league, history] = await Promise.all([
      get<any>(`/entry/${ENTRY}/`),
      get<any>(`/entry/${ENTRY}/event/${gw}/picks/`).catch(() => null),
      get<any>(`/event/${gw}/live/`).catch(() => null),
      get<any>(`/leagues-classic/${LEAGUE}/standings/`).catch(() => null),
      get<any>(`/entry/${ENTRY}/history/`).catch(() => null),
    ]);

    const teams = new Map<number, string>(boot.teams.map((t: any) => [t.id, t.short_name]));
    const players = new Map<number, any>(boot.elements.map((p: any) => [p.id, p]));
    const livePts = new Map<number, { pts: number; mins: number }>(
      (live?.elements ?? []).map((e: any) => [e.id, { pts: e.stats.total_points, mins: e.stats.minutes }])
    );
    const POS = ["", "GKP", "DEF", "MID", "FWD"];

    const squad = (picks?.picks ?? []).map((p: any) => {
      const pl = players.get(p.element);
      const lp = livePts.get(p.element) ?? { pts: 0, mins: 0 };
      return {
        id: p.element,
        name: pl?.web_name ?? "?",
        team: teams.get(pl?.team) ?? "",
        pos: POS[pl?.element_type ?? 0],
        starting: p.position <= 11,
        captain: p.is_captain,
        vice: p.is_vice_captain,
        multiplier: p.multiplier,
        points: lp.pts,
        minutes: lp.mins,
        news: pl?.news || null,
        chance: pl?.chance_of_playing_next_round ?? null,
      };
    });

    const liveTotal = squad
      .filter((s: any) => s.starting || s.multiplier > 0)
      .reduce((n: number, s: any) => n + s.points * s.multiplier, 0)
      - (picks?.entry_history?.event_transfers_cost ?? 0);

    return NextResponse.json({
      gw,
      gwName: current?.name ?? `Gameweek ${gw}`,
      gwFinished: !!current?.finished,
      next: next ? { id: next.id, name: next.name, deadline: next.deadline_time } : null,
      team: {
        name: entry.name,
        overallPoints: entry.summary_overall_points,
        overallRank: entry.summary_overall_rank,
        gwPoints: picks?.entry_history?.points ?? entry.summary_event_points,
        liveTotal,
        bank: (picks?.entry_history?.bank ?? 0) / 10,
        value: (picks?.entry_history?.value ?? 0) / 10,
        transferCost: picks?.entry_history?.event_transfers_cost ?? 0,
        activeChip: picks?.active_chip ?? null,
      },
      squad,
      chipsUsed: (history?.chips ?? []).map((c: any) => ({ name: c.name, gw: c.event })),
      league: league
        ? {
            name: league.league.name,
            rows: league.standings.results.map((r: any) => ({
              rank: r.rank,
              lastRank: r.last_rank,
              team: r.entry_name,
              manager: r.player_name,
              gw: r.event_total,
              total: r.total,
              mine: r.entry === ENTRY,
            })),
          }
        : null,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
