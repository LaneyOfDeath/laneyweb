import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// SteamSpy - completely free, no key needed
// IGDB - requires Twitch OAuth (set IGDB_CLIENT_ID + IGDB_CLIENT_SECRET in .env.local)

interface SteamGame {
  appid: number;
  name: string;
  developer: string;
  publisher: string;
  owners: string;
  average_forever: number;
  average_2weeks: number;
  ccu: number;
  price: number;
  genre: string;
  tags: Record<string, number>;
}

async function fetchSteamTop(): Promise<SteamGame[]> {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.values(data)
      .sort((a: unknown, b: unknown) => ((b as SteamGame).ccu ?? 0) - ((a as SteamGame).ccu ?? 0))
      .slice(0, 10) as SteamGame[];
  } catch { return []; }
}

async function fetchIGDBChart(): Promise<unknown[]> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  try {
    // Get Twitch OAuth token
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST", next: { revalidate: 3600 } }
    );
    if (!tokenRes.ok) return [];
    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    const gamesRes = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": clientId,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body: `fields name,cover.url,rating,first_release_date,genres.name,platforms.name;
             where first_release_date > ${Math.floor(Date.now() / 1000) - 86400 * 365};
             sort aggregated_rating desc;
             limit 10;`,
      next: { revalidate: 3600 },
    });
    if (!gamesRes.ok) return [];
    return await gamesRes.json();
  } catch { return []; }
}

export async function GET() {
  try {
    const [steamGames, igdbGames] = await Promise.all([fetchSteamTop(), fetchIGDBChart()]);
    return NextResponse.json({
      steam: steamGames,
      igdb: igdbGames,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Gaming API error:", err);
    return NextResponse.json({ error: "Failed to fetch gaming data", steam: [], igdb: [] }, { status: 502 });
  }
}
