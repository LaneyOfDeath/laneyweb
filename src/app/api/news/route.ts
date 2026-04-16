import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GNews API - 100 free requests/day
// Fallback: RSS feeds parsed via server

const GNEWS_KEY = process.env.GNEWS_API_KEY ?? "";
const NEWSAPI_KEY = process.env.NEWS_API_KEY ?? "";

interface Article {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string; url?: string };
  category: string;
}

async function fetchGNews(category: string): Promise<Article[]> {
  if (!GNEWS_KEY) return [];
  const url = `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&max=10&token=${GNEWS_KEY}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles ?? []).map((a: Record<string, unknown>) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.image,
    publishedAt: a.publishedAt,
    source: a.source,
    category,
  }));
}

async function fetchNewsAPI(category: string): Promise<Article[]> {
  if (!NEWSAPI_KEY) return [];
  const url = `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=10&apiKey=${NEWSAPI_KEY}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.articles ?? []).map((a: Record<string, unknown>) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: (a as Record<string, unknown>).urlToImage as string | null,
    publishedAt: a.publishedAt,
    source: a.source,
    category,
  }));
}

// No-key fallback: use public RSS via rss2json.com free tier
async function fetchRSS(feed: string, category: string): Promise<Article[]> {
  try {
    const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}&count=10`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items ?? []).slice(0, 10).map((item: Record<string, unknown>) => ({
      title: item.title,
      description: item.description ? String(item.description).replace(/<[^>]*>/g, "").slice(0, 200) : null,
      url: item.link,
      image: item.thumbnail ?? item.enclosure ?? null,
      publishedAt: item.pubDate,
      source: { name: data.feed?.title ?? "RSS Feed" },
      category,
    }));
  } catch {
    return [];
  }
}

const RSS_FEEDS: Record<string, string> = {
  general: "https://feeds.bbci.co.uk/news/rss.xml",
  world: "https://feeds.bbci.co.uk/news/world/rss.xml",
  technology: "https://feeds.bbci.co.uk/news/technology/rss.xml",
  business: "https://feeds.bbci.co.uk/news/business/rss.xml",
  science: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
  sports: "https://feeds.bbci.co.uk/sport/rss.xml",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "general";

  try {
    let articles: Article[] = [];

    if (GNEWS_KEY) {
      articles = await fetchGNews(category);
    } else if (NEWSAPI_KEY) {
      articles = await fetchNewsAPI(category);
    }

    // Always try RSS as supplement/fallback
    const rssFeed = RSS_FEEDS[category] ?? RSS_FEEDS.general;
    if (articles.length < 5) {
      const rssArticles = await fetchRSS(rssFeed, category);
      articles = [...articles, ...rssArticles].slice(0, 20);
    }

    return NextResponse.json({ articles, category, timestamp: Date.now() });
  } catch (err) {
    console.error("News API error:", err);
    return NextResponse.json({ error: "Failed to fetch news", articles: [] }, { status: 502 });
  }
}
