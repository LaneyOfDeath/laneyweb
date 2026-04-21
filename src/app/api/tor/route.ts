import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Tor Project Metrics API — all public, no key needed
// https://metrics.torproject.org/

async function fetchRelayCount() {
  try {
    const res = await fetch("https://onionoo.torproject.org/summary?limit=1&fields=r", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      relays: (data.relays_truncated ?? 0) + (data.relays?.length ?? 0),
      bridges: (data.bridges_truncated ?? 0) + (data.bridges?.length ?? 0),
    };
  } catch { return null; }
}

async function fetchBandwidth() {
  try {
    const res = await fetch(
      "https://metrics.torproject.org/bandwidth.json",
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const points = data.bandwidth?.data ?? [];
    const last = points[points.length - 1];
    const prev = points[points.length - 8];
    return {
      readGbps: last ? (last[1] / 1e9).toFixed(2) : null,
      writeGbps: last ? (last[2] / 1e9).toFixed(2) : null,
      date: last ? last[0] : null,
      trend: last && prev ? (last[1] > prev[1] ? "up" : "down") : null,
    };
  } catch { return null; }
}

async function fetchRelaysByCountry() {
  try {
    const res = await fetch(
      "https://onionoo.torproject.org/details?type=relay&running=true&fields=country,bandwidth_rate&limit=2000",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const counts: Record<string, number> = {};
    for (const r of (data.relays ?? [])) {
      if (r.country) counts[r.country] = (counts[r.country] ?? 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([country, count]) => ({ country: country.toUpperCase(), count }));
  } catch { return []; }
}

async function fetchTopRelays() {
  try {
    const res = await fetch(
      "https://onionoo.torproject.org/details?type=relay&running=true&order=-consensus_weight&fields=nickname,country,bandwidth_rate,flags,consensus_weight&limit=15",
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.relays ?? []).map((r: Record<string, unknown>) => ({
      nickname: r.nickname,
      country: (r.country as string | undefined)?.toUpperCase() ?? "??",
      bandwidthMbps: r.bandwidth_rate ? ((r.bandwidth_rate as number) / 1e6).toFixed(1) : "?",
      flags: r.flags,
      weight: r.consensus_weight,
    }));
  } catch { return []; }
}

export async function GET() {
  const [summary, bandwidth, byCountry, topRelays] = await Promise.all([
    fetchRelayCount(),
    fetchBandwidth(),
    fetchRelaysByCountry(),
    fetchTopRelays(),
  ]);

  return NextResponse.json({ summary, bandwidth, byCountry, topRelays, timestamp: Date.now() });
}
