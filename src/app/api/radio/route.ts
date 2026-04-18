import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BASE = "https://de1.api.radio-browser.info/json";
const HDR  = { "User-Agent": "LaneyWeb/1.0", Accept: "application/json" };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q       = searchParams.get("q")       ?? "";
  const tag     = searchParams.get("tag")     ?? "";
  const country = searchParams.get("country") ?? "";

  let url: string;
  if (q) {
    url = `${BASE}/stations/search?name=${encodeURIComponent(q)}&limit=40&hidebroken=true&order=votes&reverse=true`;
  } else if (tag) {
    url = `${BASE}/stations/search?tag=${encodeURIComponent(tag)}&limit=40&hidebroken=true&order=votes&reverse=true`;
  } else if (country) {
    url = `${BASE}/stations/search?countrycode=${encodeURIComponent(country)}&limit=40&hidebroken=true&order=votes&reverse=true`;
  } else {
    // Default: top UK stations by votes — surfaces BBC, Capital, Heart, Classic FM etc.
    url = `${BASE}/stations/search?countrycode=GB&limit=40&hidebroken=true&order=votes&reverse=true`;
  }

  try {
    const res = await fetch(url, { headers: HDR, next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json({ stations: [], timestamp: Date.now() });
    const data = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stations = (data as any[]).map(s => ({
      id:          s.stationuuid                   as string,
      name:        (s.name as string).trim(),
      url:         (s.url_resolved || s.url)       as string,
      favicon:     (s.favicon || null)             as string | null,
      tags:        s.tags ? (s.tags as string).split(",").slice(0, 4).map((t: string) => t.trim()).filter(Boolean) : [],
      country:     s.country     as string,
      countryCode: s.countrycode as string,
      language:    s.language    as string,
      codec:       s.codec       as string,
      bitrate:     s.bitrate     as number,
      clicks:      s.clickcount  as number,
    }));

    return NextResponse.json({ stations, timestamp: Date.now() });
  } catch {
    return NextResponse.json({ stations: [], timestamp: Date.now() });
  }
}
