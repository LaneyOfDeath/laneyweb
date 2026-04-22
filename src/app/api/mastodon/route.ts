import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface MastodonStatus {
  id: string;
  content: string;
  url: string;
  created_at: string;
  reblogs_count: number;
  favourites_count: number;
  replies_count: number;
  account: { display_name: string; acct: string; avatar: string };
  media_attachments: { type: string; preview_url: string }[];
}

interface MastodonTag {
  name: string;
  url: string;
  history: { day: string; uses: string; accounts: string }[];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchTrendingStatuses() {
  try {
    const res = await fetch(
      "https://mastodon.social/api/v1/trends/statuses?limit=20",
      { cache: "no-store", headers: { "User-Agent": "LaneyWeb/1.0" } }
    );
    if (!res.ok) return [];
    const data: MastodonStatus[] = await res.json();
    return data.map((s) => ({
      id: s.id,
      content: stripHtml(s.content).slice(0, 280),
      url: s.url,
      createdAt: s.created_at,
      reblogs: s.reblogs_count,
      favourites: s.favourites_count,
      replies: s.replies_count,
      author: s.account.display_name || s.account.acct,
      acct: s.account.acct,
      avatar: s.account.avatar,
      hasImage: s.media_attachments.some((m) => m.type === "image"),
      imageUrl: s.media_attachments.find((m) => m.type === "image")?.preview_url ?? null,
    }));
  } catch { return []; }
}

async function fetchTrendingTags() {
  try {
    const res = await fetch(
      "https://mastodon.social/api/v1/trends/tags?limit=20",
      { cache: "no-store", headers: { "User-Agent": "LaneyWeb/1.0" } }
    );
    if (!res.ok) return [];
    const data: MastodonTag[] = await res.json();
    return data.map((t) => {
      const today = t.history[0];
      const yesterday = t.history[1];
      const todayUses = parseInt(today?.uses ?? "0");
      const yesterdayUses = parseInt(yesterday?.uses ?? "0");
      return {
        name: t.name,
        url: t.url,
        uses: todayUses,
        accounts: parseInt(today?.accounts ?? "0"),
        trend: yesterdayUses === 0 ? "new" : todayUses > yesterdayUses ? "up" : todayUses < yesterdayUses ? "down" : "flat",
      };
    });
  } catch { return []; }
}

export async function GET() {
  const [statuses, tags] = await Promise.all([fetchTrendingStatuses(), fetchTrendingTags()]);
  return NextResponse.json({ statuses, tags, timestamp: Date.now() });
}
