import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ISS position — Open Notify (free, no key)
async function getISSPosition() {
  try {
    const res = await fetch("http://api.open-notify.org/iss-now.json", {
      next: { revalidate: 10 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp,
    };
  } catch { return null; }
}

// ISS crew — Open Notify (free, no key)
async function getISSCrew() {
  try {
    const res = await fetch("http://api.open-notify.org/astros.json", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.people as { name: string; craft: string }[]).filter(p => p.craft === "ISS");
  } catch { return []; }
}

// Upcoming launches — The Space Devs (free, no key for basic use)
async function getUpcomingLaunches() {
  try {
    const res = await fetch(
      "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=8&format=json",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results ?? []).map((l: {
      name: string;
      net: string;
      status: { name: string };
      rocket: { configuration: { name: string; family: string } };
      launch_service_provider: { name: string };
      pad: { name: string; location: { name: string } };
      mission: { name: string; description: string; type: string } | null;
    }) => ({
      id: l.name,
      name: l.name,
      net: l.net,
      status: l.status?.name ?? "Go",
      rocket: l.rocket?.configuration?.name ?? "Unknown",
      provider: l.launch_service_provider?.name ?? "",
      pad: l.pad?.name ?? "",
      location: l.pad?.location?.name ?? "",
      missionName: l.mission?.name ?? "",
      missionType: l.mission?.type ?? "",
    }));
  } catch { return []; }
}

// NASA Astronomy Picture of the Day
async function getAPOD() {
  try {
    const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
    const res = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${key}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const d = await res.json();
    return {
      title:       d.title as string,
      date:        d.date as string,
      explanation: d.explanation as string,
      url:         d.url as string,
      hdurl:       (d.hdurl ?? d.url) as string,
      mediaType:   d.media_type as string,
      copyright:   (d.copyright ?? null) as string | null,
    };
  } catch { return null; }
}

// Near-Earth asteroids — NASA NeoWs (free, DEMO_KEY = 30 req/hour)
async function getAsteroids() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
    const res = await fetch(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${key}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const neos = Object.values(data.near_earth_objects ?? {}).flat() as {
      name: string;
      estimated_diameter: { kilometers: { estimated_diameter_min: number; estimated_diameter_max: number } };
      is_potentially_hazardous_asteroid: boolean;
      close_approach_data: { close_approach_date_full: string; relative_velocity: { kilometers_per_hour: string }; miss_distance: { kilometers: string } }[];
    }[];
    return neos.slice(0, 12).map(n => ({
      name: n.name,
      diameterMin: n.estimated_diameter.kilometers.estimated_diameter_min,
      diameterMax: n.estimated_diameter.kilometers.estimated_diameter_max,
      hazardous: n.is_potentially_hazardous_asteroid,
      approachTime: n.close_approach_data[0]?.close_approach_date_full ?? "",
      velocity: parseFloat(n.close_approach_data[0]?.relative_velocity.kilometers_per_hour ?? "0"),
      missDistance: parseFloat(n.close_approach_data[0]?.miss_distance.kilometers ?? "0"),
    }));
  } catch { return []; }
}

export async function GET() {
  const [iss, crew, launches, asteroids, apod] = await Promise.all([
    getISSPosition(),
    getISSCrew(),
    getUpcomingLaunches(),
    getAsteroids(),
    getAPOD(),
  ]);

  return NextResponse.json({ iss, crew, launches, asteroids, apod, timestamp: Date.now() });
}
