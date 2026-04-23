import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const date = req.nextUrl.searchParams.get("date");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const url = new URL("https://data.police.uk/api/crimes-street/all-crime");
  url.searchParams.set("lat", lat);
  url.searchParams.set("lng", lng);
  if (date) url.searchParams.set("date", date);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      return NextResponse.json({ error: "Police API error" }, { status: res.status });
    }
    const data = await res.json();
    const crimes = Array.isArray(data) ? data.slice(0, 1000) : [];
    return NextResponse.json({ crimes, total: crimes.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
