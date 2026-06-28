import { NextRequest, NextResponse } from "next/server";

const BASE = "https://api.company-information.service.gov.uk";

function authHeader() {
  const key = process.env.CH_API_KEY;
  if (!key) return null;
  // Companies House uses HTTP Basic: API key as username, empty password.
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

async function ch(path: string, auth: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: auth },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(req: NextRequest) {
  const auth = authHeader();
  if (!auth) {
    return NextResponse.json({ error: "CH_API_KEY not configured" }, { status: 503 });
  }

  const q = req.nextUrl.searchParams.get("q");
  const number = req.nextUrl.searchParams.get("number");

  try {
    // Company detail: profile + officers + PSC + recent filings
    if (number) {
      const n = encodeURIComponent(number);
      const [profile, officers, psc, filings] = await Promise.all([
        ch(`/company/${n}`, auth),
        ch(`/company/${n}/officers?items_per_page=35`, auth),
        ch(`/company/${n}/persons-with-significant-control?items_per_page=25`, auth),
        ch(`/company/${n}/filing-history?items_per_page=25`, auth),
      ]);
      if (!profile) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 });
      }
      return NextResponse.json({
        profile,
        officers: officers?.items ?? [],
        psc: psc?.items ?? [],
        filings: filings?.items ?? [],
      });
    }

    // Search
    if (q) {
      const data = await ch(`/search/companies?q=${encodeURIComponent(q)}&items_per_page=30`, auth);
      return NextResponse.json({ results: data?.items ?? [] });
    }

    return NextResponse.json({ error: "q or number required" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
