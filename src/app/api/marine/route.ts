import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// VesselFinder public tile/position API — no key needed for basic vessel positions
// Uses the same public AIS data that powers vesselfinder.com

interface Vessel {
  mmsi: string;
  name: string;
  callsign: string;
  type: string;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  heading: number | null;
  status: string;
  destination: string;
  eta: string;
  flag: string;
  length: number | null;
  width: number | null;
  draught: number | null;
}

function getVesselType(type: number): string {
  if (type >= 70 && type < 80) return "Cargo";
  if (type >= 80 && type < 90) return "Tanker";
  if (type >= 60 && type < 70) return "Passenger";
  if (type >= 30 && type < 40) return "Fishing";
  if (type === 37) return "Pleasure Craft";
  if (type >= 50 && type < 60) return "Special";
  if (type === 0) return "Unknown";
  return "Other";
}

function getNavStatus(status: number): string {
  const statuses = [
    "Under way", "At anchor", "Not under command", "Restricted manoeuvrability",
    "Constrained by draught", "Moored", "Aground", "Engaged in fishing",
    "Under way sailing", "Reserved", "Reserved", "Towing astern", "Pushing ahead",
    "Reserved", "AIS-SART", "Not defined",
  ];
  return statuses[status] ?? "Unknown";
}

async function fetchVesselFinderPublic(
  latMin: number, latMax: number,
  lonMin: number, lonMax: number
): Promise<Vessel[]> {
  try {
    // VesselFinder public vessel data endpoint
    const url = `https://www.vesselfinder.com/api/pub/vesselsonmap/v3?bbox=${lonMin},${latMin},${lonMax},${latMax}&zoom=8`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.vesselfinder.com/",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];
    const data = await res.json();

    // VesselFinder returns array of vessel arrays
    // Format: [mmsi, lat, lon, course, speed, shiptype, flag, name, ...]
    const vessels: Vessel[] = [];
    const items = Array.isArray(data) ? data : (data.vessels ?? data.data ?? []);

    for (const v of items.slice(0, 150)) {
      if (Array.isArray(v)) {
        // Packed array format
        vessels.push({
          mmsi:        String(v[0] ?? ""),
          name:        String(v[7] ?? "Unknown").trim(),
          callsign:    "",
          type:        getVesselType(Number(v[5] ?? 0)),
          latitude:    Number(v[1] ?? 0),
          longitude:   Number(v[2] ?? 0),
          course:      Math.round(Number(v[3] ?? 0)),
          speed:       Number((Number(v[4] ?? 0) / 10).toFixed(1)),
          heading:     null,
          status:      "Under way",
          destination: "",
          eta:         "",
          flag:        String(v[6] ?? ""),
          length:      null,
          width:       null,
          draught:     null,
        });
      } else if (typeof v === "object" && v !== null) {
        // Object format
        vessels.push({
          mmsi:        String(v.mmsi ?? v.MMSI ?? ""),
          name:        String(v.name ?? v.NAME ?? "Unknown").trim(),
          callsign:    String(v.callsign ?? ""),
          type:        getVesselType(Number(v.type ?? v.shiptype ?? 0)),
          latitude:    Number(v.lat ?? v.latitude ?? 0),
          longitude:   Number(v.lon ?? v.longitude ?? 0),
          course:      Math.round(Number(v.course ?? v.cog ?? 0)),
          speed:       Number(((v.speed ?? v.sog ?? 0) / 10).toFixed(1)),
          heading:     v.heading ? Number(v.heading) : null,
          status:      getNavStatus(Number(v.status ?? v.navstat ?? 0)),
          destination: String(v.destination ?? "").trim(),
          eta:         String(v.eta ?? "").trim(),
          flag:        String(v.flag ?? v.country ?? ""),
          length:      v.length ? Number(v.length) : null,
          width:       v.width ? Number(v.width) : null,
          draught:     v.draught ? Number(v.draught) : null,
        });
      }
    }

    return vessels.filter((v) => v.latitude !== 0 && v.longitude !== 0);
  } catch (err) {
    console.error("VesselFinder fetch error:", err);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat    = parseFloat(searchParams.get("lat")    ?? "51.5");
  const lon    = parseFloat(searchParams.get("lon")    ?? "1.0");
  const radius = parseFloat(searchParams.get("radius") ?? "4");

  const vessels = await fetchVesselFinderPublic(
    lat - radius, lat + radius,
    lon - radius, lon + radius
  );

  return NextResponse.json({
    vessels,
    total: vessels.length,
    hasKey: true,
    timestamp: Date.now(),
  });
}
