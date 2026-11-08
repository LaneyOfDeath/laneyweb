import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TEAM = 382; // Manchester City on ESPN
const SITE = "https://site.api.espn.com/apis/site/v2/sports/soccer";
const V2 = "https://site.api.espn.com/apis/v2/sports/soccer";
const HDR = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

async function get(url: string) {
  const r = await fetch(url, { headers: HDR, cache: "no-store" });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.json();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function score(c: any) {
  const s = c?.score;
  if (s == null) return null;
  return typeof s === "object" ? s.displayValue ?? null : String(s);
}

function match(e: any) {
  const comp = e.competitions?.[0] ?? {};
  const cs = comp.competitors ?? [];
  const home = cs.find((c: any) => c.homeAway === "home") ?? cs[0];
  const away = cs.find((c: any) => c.homeAway === "away") ?? cs[1];
  const st = comp.status ?? e.status ?? {};
  return {
    id: e.id,
    date: e.date,
    comp: e.league?.abbreviation ?? e.league?.name ?? comp.type?.abbreviation ?? null,
    state: st.type?.state ?? "pre",
    detail: st.type?.shortDetail ?? st.type?.description ?? "",
    clock: st.displayClock ?? null,
    venue: comp.venue?.fullName ?? null,
    home: { name: home?.team?.displayName, short: home?.team?.abbreviation, logo: home?.team?.logos?.[0]?.href ?? home?.team?.logo ?? null, score: score(home) },
    away: { name: away?.team?.displayName, short: away?.team?.abbreviation, logo: away?.team?.logos?.[0]?.href ?? away?.team?.logo ?? null, score: score(away) },
  };
}

export async function GET() {
  try {
    const [fixtures, results, table, board] = await Promise.all([
      get(`${SITE}/eng.1/teams/${TEAM}/schedule?fixture=true`).catch(() => ({ events: [] })),
      get(`${SITE}/eng.1/teams/${TEAM}/schedule`).catch(() => ({ events: [] })),
      get(`${V2}/eng.1/standings`).catch(() => null),
      get(`${SITE}/eng.1/scoreboard`).catch(() => ({ events: [] })),
    ]);

    const upcoming = (fixtures.events ?? []).map(match)
      .filter((m: any) => m.state !== "post")
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    const played = (results.events ?? []).map(match)
      .filter((m: any) => m.state === "post")
      .sort((a: any, b: any) => b.date.localeCompare(a.date));

    const live = (board.events ?? []).map(match)
      .find((m: any) => m.state === "in" && (m.home.short === "MNC" || m.away.short === "MNC")) ?? null;

    const entries = table?.children?.[0]?.standings?.entries ?? [];
    const stat = (x: any, n: string) => x.stats?.find((s: any) => s.name === n)?.value ?? 0;
    const rows = entries.map((x: any) => ({
      rank: stat(x, "rank"),
      team: x.team.displayName,
      short: x.team.abbreviation,
      logo: x.team.logos?.[0]?.href ?? null,
      played: stat(x, "gamesPlayed"),
      won: stat(x, "wins"),
      drawn: stat(x, "ties"),
      lost: stat(x, "losses"),
      gd: stat(x, "pointDifferential"),
      points: stat(x, "points"),
      mine: x.team.id === String(TEAM),
    })).sort((a: any, b: any) => a.rank - b.rank);

    return NextResponse.json({
      live,
      next: upcoming[0] ?? null,
      upcoming: upcoming.slice(0, 6),
      results: played.slice(0, 6),
      table: rows,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
