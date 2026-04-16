import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Free data sources:
// - Yahoo Finance unofficial API (no key, widely used)
// - Crypto via CoinGecko (no key for basic)

const SYMBOLS = ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^DAX", "^N225", "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META", "BTC-USD", "ETH-USD"];

async function fetchYahooQuote(symbol: string) {
  const encoded = encodeURIComponent(symbol);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  const price = meta.regularMarketPrice ?? 0;
  const prev  = meta.previousClose ?? meta.chartPreviousClose ?? price;
  const change        = price - prev;
  const changePercent = prev !== 0 ? (change / prev) * 100 : 0;
  return {
    symbol: meta.symbol ?? symbol,
    name: meta.shortName ?? meta.symbol ?? symbol,
    price,
    previousClose: prev,
    change,
    changePercent,
    currency: meta.currency ?? "USD",
    marketState: meta.marketState ?? "CLOSED",
    type: symbol.startsWith("^") ? "index" : symbol.endsWith("-USD") ? "crypto" : "stock",
  };
}

export async function GET() {
  try {
    const results = await Promise.allSettled(SYMBOLS.map(fetchYahooQuote));
    const quotes = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);

    return NextResponse.json({ quotes, timestamp: Date.now() });
  } catch (err) {
    console.error("Stocks API error:", err);
    return NextResponse.json({ error: "Failed to fetch market data", quotes: [] }, { status: 502 });
  }
}
