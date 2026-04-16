import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ── Steam top by CCU (SteamSpy, no key) ─────────────────────────────────────
async function fetchSteamTop() {
  try {
    const res = await fetch("https://steamspy.com/api.php?request=top100in2weeks", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Object.values(data)
      .sort((a: unknown, b: unknown) => ((b as { ccu: number }).ccu ?? 0) - ((a as { ccu: number }).ccu ?? 0))
      .slice(0, 10)
      .map((g: unknown) => {
        const game = g as { appid: number; name: string; developer: string; ccu: number; average_2weeks: number; genre: string };
        return { appid: game.appid, name: game.name, developer: game.developer, ccu: game.ccu, average_2weeks: game.average_2weeks, genre: game.genre };
      });
  } catch { return []; }
}

// ── Twitch top streams (uses same Twitch/IGDB credentials) ──────────────────
async function fetchTwitchStreams() {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];
  try {
    const tokenRes = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: "POST", cache: "no-store" }
    );
    if (!tokenRes.ok) return [];
    const { access_token } = await tokenRes.json();

    const res = await fetch("https://api.twitch.tv/helix/streams?first=10", {
      headers: { "Client-ID": clientId, "Authorization": `Bearer ${access_token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((s: Record<string, unknown>) => ({
      id: s.id,
      userName: s.user_name,
      gameName: s.game_name,
      title: s.title,
      viewers: s.viewer_count,
      thumbnail: (s.thumbnail_url as string)?.replace("{width}", "320").replace("{height}", "180"),
      language: s.language,
    }));
  } catch { return []; }
}

// ── Epic free games (unofficial public endpoint, no key) ────────────────────
async function fetchEpicFree() {
  try {
    const res = await fetch(
      "https://store-site-backend-static.ak.epicgames.com/freeGamesPromotions?locale=en-US&country=GB&allowCountries=GB",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const games = data?.data?.Catalog?.searchStore?.elements ?? [];
    return games
      .filter((g: Record<string, unknown>) => {
        const promos = (g.promotions as Record<string, unknown> | null)?.promotionalOffers;
        return Array.isArray(promos) && (promos as unknown[]).length > 0;
      })
      .map((g: Record<string, unknown>) => {
        const img = (g.keyImages as { type: string; url: string }[] | undefined)?.find(
          (i) => i.type === "OfferImageWide" || i.type === "Thumbnail"
        )?.url;
        const promos = ((g.promotions as Record<string, unknown>)?.promotionalOffers as { promotionalOffers: { startDate: string; endDate: string }[] }[])?.[0]?.promotionalOffers?.[0];
        return {
          title: g.title,
          description: g.description,
          image: img,
          url: `https://store.epicgames.com/en-US/p/${g.productSlug ?? g.urlSlug}`,
          endDate: promos?.endDate,
        };
      });
  } catch { return []; }
}

// ── RAWG upcoming releases (RAWG_API_KEY optional, free 20k/mo) ─────────────
async function fetchUpcoming() {
  const key = process.env.RAWG_API_KEY;
  if (!key) return [];
  try {
    const today = new Date().toISOString().split("T")[0];
    const future = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${key}&dates=${today},${future}&ordering=-added&page_size=12`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((g: Record<string, unknown>) => ({
      id: g.id,
      name: g.name,
      released: g.released,
      rating: g.rating,
      image: g.background_image,
      platforms: ((g.platforms as { platform: { name: string } }[] | undefined) ?? []).slice(0, 3).map((p) => p.platform.name),
    }));
  } catch { return []; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("search");

  // Search mode
  if (q) {
    const key = process.env.RAWG_API_KEY;
    if (!key) return NextResponse.json({ results: [], noKey: true });
    try {
      const res = await fetch(`https://api.rawg.io/api/games?key=${key}&search=${encodeURIComponent(q)}&page_size=12`, { cache: "no-store" });
      if (!res.ok) return NextResponse.json({ results: [] });
      const data = await res.json();
      return NextResponse.json({
        results: (data.results ?? []).map((g: Record<string, unknown>) => ({
          id: g.id,
          name: g.name,
          released: g.released,
          rating: g.rating,
          image: g.background_image,
          platforms: ((g.platforms as { platform: { name: string } }[] | undefined) ?? []).slice(0, 3).map((p) => p.platform.name),
          genres: ((g.genres as { name: string }[] | undefined) ?? []).slice(0, 2).map((x) => x.name),
        })),
      });
    } catch { return NextResponse.json({ results: [] }); }
  }

  const [steam, twitch, epicFree, upcoming] = await Promise.all([
    fetchSteamTop(),
    fetchTwitchStreams(),
    fetchEpicFree(),
    fetchUpcoming(),
  ]);

  return NextResponse.json({ steam, twitch, epicFree, upcoming, timestamp: Date.now() });
}
