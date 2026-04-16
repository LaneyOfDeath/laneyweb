"use client";

import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink, RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Article {
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  source: { name: string };
  category: string;
}

const CATEGORIES = ["general", "world", "technology", "business", "science", "sports"] as const;
type Category = typeof CATEGORIES[number];

export default function NewsDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>("general");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/news?category=${category}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      setArticles(json.articles ?? []);
      setLastUpdate(new Date());
    } catch {
      setError("News feed temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // 5 min
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="p-6 space-y-5">
      {/* Category tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                category === c
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                  : "bg-white/5 text-[#94a3b8] border border-[#1e2a3a] hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-xs text-[#64748b]">
          {lastUpdate && <span>Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[#111827] border border-[#1e2a3a] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3 rounded-xl border border-[#1e2a3a] bg-[#111827] overflow-hidden
                         hover:border-purple-500/30 hover:bg-[#131a2e] transition-all duration-200"
            >
              {a.image && (
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent" />
                </div>
              )}
              <div className="px-4 pb-4 flex flex-col gap-2 flex-1">
                <p className="text-sm font-semibold text-white leading-snug group-hover:text-purple-300 transition-colors line-clamp-2">
                  {a.title}
                </p>
                {a.description && (
                  <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">{a.description}</p>
                )}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="flex items-center gap-1.5">
                    <Newspaper className="w-3 h-3 text-[#64748b]" />
                    <span className="text-[11px] text-[#64748b]">{a.source.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {a.publishedAt && (
                      <span className="text-[10px] text-[#64748b] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(a.publishedAt), { addSuffix: true })}
                      </span>
                    )}
                    <ExternalLink className="w-3 h-3 text-[#64748b] group-hover:text-purple-400 ml-1" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <p className="text-xs text-[#64748b]">
        Data via BBC RSS (no key) / GNews / NewsAPI · Set GNEWS_API_KEY or NEWS_API_KEY in .env.local for broader coverage
      </p>
    </div>
  );
}
