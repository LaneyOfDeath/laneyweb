import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// National Grid ESO Carbon Intensity API — free, no key
// https://api.carbonintensity.org.uk

async function getCarbonIntensity() {
  try {
    const res = await fetch("https://api.carbonintensity.org.uk/intensity", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const d = data.data?.[0];
    if (!d) return null;
    return {
      from: d.from,
      to: d.to,
      actual: d.intensity?.actual ?? null,
      forecast: d.intensity?.forecast ?? null,
      index: d.intensity?.index ?? "moderate",
    };
  } catch { return null; }
}

// Generation mix — National Grid ESO
async function getGenerationMix() {
  try {
    const res = await fetch("https://api.carbonintensity.org.uk/generation", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.generationmix ?? []) as { fuel: string; perc: number }[];
  } catch { return []; }
}

// 24h carbon intensity window
async function getCarbonHistory() {
  try {
    const now = new Date();
    const from = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const to = now.toISOString();
    const res = await fetch(
      `https://api.carbonintensity.org.uk/intensity/${from}/${to}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 1800 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map((d: {
      from: string;
      intensity: { actual: number | null; forecast: number; index: string };
    }) => ({
      from: d.from,
      actual: d.intensity?.actual ?? d.intensity?.forecast ?? 0,
      index: d.intensity?.index ?? "moderate",
    }));
  } catch { return []; }
}

// Regional breakdown
async function getRegionalData() {
  try {
    const res = await fetch("https://api.carbonintensity.org.uk/regional", {
      headers: { Accept: "application/json" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.[0]?.regions ?? []).map((r: {
      regionid: number;
      shortname: string;
      intensity: { forecast: number; index: string };
      generationmix: { fuel: string; perc: number }[];
    }) => ({
      id: r.regionid,
      name: r.shortname,
      forecast: r.intensity?.forecast ?? 0,
      index: r.intensity?.index ?? "moderate",
      mix: r.generationmix ?? [],
    }));
  } catch { return []; }
}

export async function GET() {
  const [intensity, mix, history, regions] = await Promise.all([
    getCarbonIntensity(),
    getGenerationMix(),
    getCarbonHistory(),
    getRegionalData(),
  ]);

  return NextResponse.json({ intensity, mix, history, regions, timestamp: Date.now() });
}
