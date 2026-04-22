"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, Hash, Heart, Repeat2, MessageCircle, ExternalLink } from "lucide-react";
import LiveTimestamp from "@/components/LiveTimestamp";

interface Status {
  id: string;
  content: string;
  url: string;
  createdAt: string;
  reblogs: number;
  favourites: number;
  replies: number;
  author: string;
  acct: string;
  avatar: string;
  hasImage: boolean;
  imageUrl: string | null;
}

interface Tag {
  name: string;
  url: string;
  uses: number;
  accounts: number;
  trend: "up" | "down" | "flat" | "new";
}

interface MastodonData {
  statuses: Status[];
  tags: Tag[];
  timestamp: number;
}

const REFRESH_MS = 60_000;

function trendColor(t: Tag["trend"]) {
  if (t === "up" || t === "new") return "text-emerald-400";
  if (t === "down") return "text-red-400";
  return "text-[#64748b]";
}

function trendArrow(t: Tag["trend"]) {
  if (t === "up") return "↑";
  if (t === "down") return "↓";
  if (t === "new") return "★";
  return "→";
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.round(diff)}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function MastodonDashboard() {
  const [data, setData] = useState<MastodonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"posts" | "tags">("posts");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/mastodon");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, REFRESH_MS);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)" }}>
            <TrendingUp className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Mastodon Trending</h1>
            <p className="text-[11px] text-[#64748b]">mastodon.social · public API · no key</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {data && <LiveTimestamp date={new Date(data.timestamp)} />}
          <button onClick={load} disabled={loading}
            className="p-1.5 rounded-lg bg-[#111827] border border-[#1e2a3a] hover:border-indigo-500/40 transition-colors disabled:opacity-40">
            <RefreshCw className={`w-3.5 h-3.5 text-[#64748b] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["posts", "tags"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t
                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                : "bg-[#111827] border border-[#1e2a3a] text-[#64748b] hover:border-[#243352]"
            }`}>
            {t === "posts" ? "Trending Posts" : "Trending Hashtags"}
          </button>
        ))}
      </div>

      {loading && !data && (
        <div className="flex items-center justify-center h-48">
          <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
      )}

      {/* Posts tab */}
      {!loading && tab === "posts" && data && (
        <div className="space-y-2">
          {data.statuses.length === 0 && (
            <p className="text-sm text-[#64748b] text-center py-8">No trending posts available</p>
          )}
          {data.statuses.map((s) => (
            <div key={s.id} className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-3 hover:border-indigo-500/30 transition-colors">
              <div className="flex items-start gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0 bg-[#1e2a3a]" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-white truncate">{s.author}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-[#64748b]">{timeAgo(s.createdAt)}</span>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-[#64748b] hover:text-indigo-400 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-3">{s.content}</p>
                  {s.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt="" className="mt-2 rounded-lg max-h-32 object-cover w-full" />
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                      <Heart className="w-3 h-3 text-pink-400" />{s.favourites.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                      <Repeat2 className="w-3 h-3 text-emerald-400" />{s.reblogs.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                      <MessageCircle className="w-3 h-3 text-sky-400" />{s.replies.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tags tab */}
      {!loading && tab === "tags" && data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.tags.length === 0 && (
            <p className="text-sm text-[#64748b] text-center py-8 col-span-2">No trending hashtags available</p>
          )}
          {data.tags.map((tag, i) => (
            <a key={tag.name} href={tag.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-[#1e2a3a] bg-[#111827] p-3 hover:border-indigo-500/30 transition-colors">
              <span className="text-[11px] font-black text-[#374151] w-5 text-right flex-shrink-0">#{i + 1}</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Hash className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">#{tag.name}</p>
                <p className="text-[10px] text-[#64748b]">{tag.uses.toLocaleString()} posts · {tag.accounts.toLocaleString()} accounts today</p>
              </div>
              <span className={`text-sm font-black flex-shrink-0 ${trendColor(tag.trend)}`}>
                {trendArrow(tag.trend)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
