import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const amount = searchParams.get("amount") ?? "10";
  const category = searchParams.get("category") ?? "";
  const difficulty = searchParams.get("difficulty") ?? "";

  let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
  if (category) url += `&category=${category}`;
  if (difficulty) url += `&difficulty=${difficulty}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 502 });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
