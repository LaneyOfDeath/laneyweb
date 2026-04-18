import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ESPN   = "https://site.api.espn.com/apis/site/v2/sports";
const ESPN_V2 = "https://site.api.espn.com/apis/v2/sports";
const JOLPI  = "https://api.jolpi.ca/ergast/f1";
const HDR    = { "User-Agent": "Mozilla/5.0", Accept: "application/json" };

export const LEAGUES: Record<string, { name: string; slug: string; sport: string; flag: string }> = {
  epl:        { name: "Premier League",   slug: "soccer/eng.1",          sport: "soccer",      flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  laliga:     { name: "La Liga",          slug: "soccer/esp.1",          sport: "soccer",      flag: "🇪🇸" },
  bundesliga: { name: "Bundesliga",       slug: "soccer/ger.1",          sport: "soccer",      flag: "🇩🇪" },
  seriea:     { name: "Serie A",          slug: "soccer/ita.1",          sport: "soccer",      flag: "🇮🇹" },
  ligue1:     { name: "Ligue 1",          slug: "soccer/fra.1",          sport: "soccer",      flag: "🇫🇷" },
  ucl:        { name: "Champions League", slug: "soccer/uefa.champions", sport: "soccer",      flag: "🏆" },
  nba:        { name: "NBA",              slug: "basketball/nba",        sport: "basketball",  flag: "🏀" },
  nfl:        { name: "NFL",              slug: "football/nfl",          sport: "football",    flag: "🏈" },
  nhl:        { name: "NHL",              slug: "hockey/nhl",            sport: "hockey",      flag: "🏒" },
  mlb:        { name: "MLB",              slug: "baseball/mlb",          sport: "baseball",    flag: "⚾" },
  f1:         { name: "Formula 1",        slug: "",                      sport: "motorsport",  flag: "🏎️" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeEvent(e: any) {
  const comp = e.competitions?.[0];
  const competitors = comp?.competitors ?? [];
  const home = competitors.find((c: any) => c.homeAway === "home") ?? competitors[0];
  const away = competitors.find((c: any) => c.homeAway === "away") ?? competitors[1];
  return {
    id: e.id,
    name: e.name,
    date: e.date,
    state:  e.status?.type?.state ?? "pre",
    status: e.status?.type?.description ?? "Scheduled",
    clock:  e.status?.displayClock ?? null,
    period: e.status?.period ?? null,
    home: { name: home?.team?.displayName, logo: home?.team?.logo ?? null, score: home?.score ?? null, winner: home?.winner ?? false },
    away: { name: away?.team?.displayName, logo: away?.team?.logo ?? null, score: away?.score ?? null, winner: away?.winner ?? false },
    venue: comp?.venue?.fullName ?? null,
  };
}

async function getScores(slug: string) {
  try {
    const r = await fetch(`${ESPN}/${slug}/scoreboard`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.events ?? []).map(normalizeEvent);
  } catch { return []; }
}

async function getFixtures(slug: string) {
  const from = new Date();
  const to   = new Date(Date.now() + 14 * 86400000);
  const fmt  = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  try {
    const r = await fetch(`${ESPN}/${slug}/scoreboard?dates=${fmt(from)}-${fmt(to)}&limit=20`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.events ?? []).filter((e: any) => e.status?.type?.state === "pre").slice(0, 15).map(normalizeEvent);
  } catch { return []; }
}

async function getResults(slug: string) {
  const to   = new Date();
  const from = new Date(Date.now() - 10 * 86400000);
  const fmt  = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  try {
    const r = await fetch(`${ESPN}/${slug}/scoreboard?dates=${fmt(from)}-${fmt(to)}&limit=30`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d.events ?? []).filter((e: any) => e.status?.type?.state === "post").slice(-15).reverse().map(normalizeEvent);
  } catch { return []; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stat(stats: any[], name: string): number {
  return stats?.find((s: any) => s.name === name)?.value ?? 0;
}

async function getStandings(slug: string) {
  try {
    const r = await fetch(`${ESPN_V2}/${slug}/standings`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    const groups: { groupName: string; entries: unknown[] }[] = [];
    for (const child of (d.children ?? [d])) {
      const entries = (child.standings?.entries ?? []).map((e: any) => ({
        rank:       stat(e.stats, "rank") || stat(e.stats, "playoffSeed"),
        team:       e.team?.displayName,
        shortName:  e.team?.abbreviation,
        logo:       e.team?.logos?.[0]?.href,
        played:     stat(e.stats, "gamesPlayed"),
        wins:       stat(e.stats, "wins"),
        losses:     stat(e.stats, "losses"),
        draws:      stat(e.stats, "ties"),
        gf:         stat(e.stats, "pointsFor"),
        ga:         stat(e.stats, "pointsAgainst"),
        gd:         stat(e.stats, "pointDifferential"),
        points:     stat(e.stats, "points"),
        pct:        stat(e.stats, "winPercent") || stat(e.stats, "leagueWinPercent"),
        gb:         stat(e.stats, "gamesBehind"),
        otl:        stat(e.stats, "otLosses"),
        streak:     stat(e.stats, "streak"),
        rankChange: stat(e.stats, "rankChange"),
      })).sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999));
      groups.push({ groupName: child.name ?? "", entries });
    }
    return groups;
  } catch { return []; }
}

// F1 via Jolpica
async function f1Drivers() {
  try {
    const year = new Date().getFullYear();
    const r = await fetch(`${JOLPI}/${year}/driverstandings.json`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? []).map((s: any) => ({
      position: +s.position,
      name: `${s.Driver.givenName} ${s.Driver.familyName}`,
      code: s.Driver.code,
      nationality: s.Driver.nationality,
      team: s.Constructors?.[0]?.name ?? "",
      points: +s.points,
      wins: +s.wins,
    }));
  } catch { return []; }
}

async function f1Constructors() {
  try {
    const year = new Date().getFullYear();
    const r = await fetch(`${JOLPI}/${year}/constructorstandings.json`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? []).map((s: any) => ({
      position: +s.position,
      team: s.Constructor.name,
      nationality: s.Constructor.nationality,
      points: +s.points,
      wins: +s.wins,
    }));
  } catch { return []; }
}

async function f1Calendar() {
  try {
    const year = new Date().getFullYear();
    const r = await fetch(`${JOLPI}/${year}.json`, { headers: HDR, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json();
    return (d?.MRData?.RaceTable?.Races ?? []).map((race: any) => ({
      round:   +race.round,
      name:    race.raceName,
      circuit: race.Circuit.circuitName,
      country: race.Circuit.Location.country,
      date:    race.date,
      time:    race.time ?? null,
    }));
  } catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") ?? "epl";
  const type   = searchParams.get("type")   ?? "scores";

  if (league === "f1") {
    let data;
    if (type === "constructors") data = await f1Constructors();
    else if (type === "calendar")    data = await f1Calendar();
    else                             data = await f1Drivers();
    return NextResponse.json({ league: LEAGUES.f1, type, data, timestamp: Date.now() });
  }

  const info = LEAGUES[league] ?? LEAGUES.epl;
  let data;
  if      (type === "standings") data = await getStandings(info.slug);
  else if (type === "fixtures")  data = await getFixtures(info.slug);
  else if (type === "results")   data = await getResults(info.slug);
  else                           data = await getScores(info.slug);

  return NextResponse.json({ league: info, type, data, timestamp: Date.now() });
}
