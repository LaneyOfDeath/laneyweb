import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GitHub trending — scrape via unofficial API
async function getGitHubTrending() {
  try {
    const res = await fetch(
      "https://api.gitterapp.com/repositories?since=daily",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("gitter failed");
    const data = await res.json();
    return (data ?? []).slice(0, 10).map((r: {
      name: string;
      description: string;
      language: string;
      stars: number;
      forks: number;
      added_stars: number;
      url: string;
      avatar: string;
      author: string;
    }) => ({
      name: r.name,
      author: r.author,
      description: r.description ?? "",
      language: r.language ?? "",
      stars: r.stars ?? 0,
      forks: r.forks ?? 0,
      addedStars: r.added_stars ?? 0,
      url: r.url,
    }));
  } catch {
    // Fallback: GitHub trending via gh-trending-api
    try {
      const res2 = await fetch(
        "https://gh-trending-api.vercel.app/repositories",
        { next: { revalidate: 3600 } }
      );
      if (!res2.ok) return [];
      const data2 = await res2.json();
      return (Array.isArray(data2) ? data2 : []).slice(0, 10).map((r: {
        repositoryName: string;
        description: string | null;
        language: string | null;
        totalStars: number;
        forks: number;
        starsSince: number;
        username: string;
        url: string;
      }) => ({
        name: r.repositoryName,
        author: r.username,
        description: r.description ?? "",
        language: r.language ?? "",
        stars: r.totalStars ?? 0,
        forks: r.forks ?? 0,
        addedStars: r.starsSince ?? 0,
        url: r.url,
      }));
    } catch { return []; }
  }
}

// Wikipedia recent changes via EventSource isn't available server-side,
// so we use the MediaWiki API for recent changes
async function getWikipediaEdits() {
  try {
    const res = await fetch(
      "https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&rcprop=title|user|timestamp|comment|sizes&rclimit=20&rctype=edit&format=json&origin=*",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.query?.recentchanges ?? []).map((rc: {
      title: string;
      user: string;
      timestamp: string;
      comment: string;
      oldlen: number;
      newlen: number;
    }) => ({
      title: rc.title,
      user: rc.user,
      timestamp: rc.timestamp,
      comment: rc.comment ?? "",
      delta: (rc.newlen ?? 0) - (rc.oldlen ?? 0),
    }));
  } catch { return []; }
}

// Hacker News top stories
async function getHackerNews() {
  try {
    const topRes = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { next: { revalidate: 600 } }
    );
    if (!topRes.ok) return [];
    const ids: number[] = await topRes.json();
    const top10 = ids.slice(0, 10);
    const stories = await Promise.all(
      top10.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          next: { revalidate: 600 },
        }).then(r => r.json())
      )
    );
    return stories.map((s: {
      title: string;
      url: string;
      score: number;
      descendants: number;
      by: string;
      time: number;
      id: number;
    }) => ({
      id: s.id,
      title: s.title,
      url: s.url ?? `https://news.ycombinator.com/item?id=${s.id}`,
      score: s.score ?? 0,
      comments: s.descendants ?? 0,
      by: s.by,
      time: s.time,
    }));
  } catch { return []; }
}

export async function GET() {
  const [github, wikipedia, hackernews] = await Promise.all([
    getGitHubTrending(),
    getWikipediaEdits(),
    getHackerNews(),
  ]);

  return NextResponse.json({ github, wikipedia, hackernews, timestamp: Date.now() });
}
