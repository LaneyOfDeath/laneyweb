import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get("date") ?? "";
  const url = new URL("https://api.nasa.gov/planetary/apod");
  url.searchParams.set("api_key", "DEMO_KEY");
  if (date) url.searchParams.set("date", date);

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) return NextResponse.json({ error: "NASA API error" }, { status: res.status });

  const data = await res.json();
  return NextResponse.json(data);
}
