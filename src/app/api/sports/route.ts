import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TheSportsDB - free tier (no key needed for basic data)
const BASE = "https://www.thesportsdb.com/api/v1/json/3";

async function getLivescores() {
  try {
    const res = await fetch(`${BASE}/livescore.php`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events ?? [];
  } catch { return []; }
}

async function getLeagueTable(leagueId: string) {
  try {
    const res = await fetch(`${BASE}/lookuptable.php?l=${leagueId}&s=2024-2025`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.table ?? [];
  } catch { return []; }
}

async function getUpcomingEvents(leagueId: string) {
  try {
    const res = await fetch(`${BASE}/eventsnextleague.php?id=${leagueId}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events ?? []).slice(0, 10);
  } catch { return []; }
}

async function getPastEvents(leagueId: string) {
  try {
    const res = await fetch(`${BASE}/eventspastleague.php?id=${leagueId}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events ?? []).slice(0, 10);
  } catch { return []; }
}

// Major league IDs from TheSportsDB
const LEAGUES: Record<string, { name: string; sport: string; id: string }> = {
  epl:         { name: "English Premier League", sport: "Soccer", id: "4328" },
  laliga:      { name: "La Liga", sport: "Soccer", id: "4335" },
  bundesliga:  { name: "Bundesliga", sport: "Soccer", id: "4331" },
  seriea:      { name: "Serie A", sport: "Soccer", id: "4332" },
  nba:         { name: "NBA", sport: "Basketball", id: "4387" },
  nfl:         { name: "NFL", sport: "American Football", id: "4391" },
  mlb:         { name: "MLB", sport: "Baseball", id: "4424" },
  nhl:         { name: "Ice Hockey", sport: "Hockey", id: "4380" },
  f1:          { name: "Formula 1", sport: "Motorsport", id: "4370" },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const league = searchParams.get("league") ?? "epl";
  const type = searchParams.get("type") ?? "table";

  const leagueInfo = LEAGUES[league] ?? LEAGUES.epl;

  try {
    let data;
    if (type === "livescores") {
      data = await getLivescores();
    } else if (type === "upcoming") {
      data = await getUpcomingEvents(leagueInfo.id);
    } else if (type === "results") {
      data = await getPastEvents(leagueInfo.id);
    } else {
      data = await getLeagueTable(leagueInfo.id);
    }

    return NextResponse.json({
      league: leagueInfo,
      type,
      data,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Sports API error:", err);
    return NextResponse.json({ error: "Failed to fetch sports data", data: [] }, { status: 502 });
  }
}
