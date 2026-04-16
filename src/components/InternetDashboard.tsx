"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, GitBranch, Globe2, Flame, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GithubRepo {
  name: string; author: string; description: string; language: string;
  stars: number; forks: number; addedStars: number; url: string;
}
interface WikiEdit {
  title: string; user: string; timestamp: string; comment: string; delta: number;
}
interface HNStory {
  id: number; title: string; url: string; score: number; comments: number; by: string; time: number;
}
interface InternetData {
  github: GithubRepo[];
  wikipedia: WikiEdit[];
  hackernews: HNStory[];
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6", JavaScript: "#f1e05a", Python: "#3572A5",
  Rust: "#dea584", Go: "#00ADD8", Java: "#b07219", "C++": "#f34b7d",
  C: "#555555", Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF",
  Dart: "#00B4AB", "C#": "#178600",
};

export default function InternetDashboard() {
  const [data, setData] = useState<InternetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"github" | "wikipedia" | "hackernews">("hackernews");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/internet");
      const json = await res.json();
      setData(json);
      setLastUpdate(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh Wikipedia every 60s
  useEffect(() => {
    const t = setInterval(async () => {
      if (tab === "wikipedia") {
        const res = await fetch("/api/internet");
        const json = await res.json();
        setData(json);
        setLastUpdate(new Date());
      }
    }, 60000);
    return () => clearInterval(t);
  }, [tab]);

  const tabs = [
    { id: "hackernews" as const, label: "Hacker News", icon: Flame },
    { id: "github" as const, label: "GitHub Trending", icon: GitBranch },
    { id: "wikipedia" as const, label: "Wikipedia Edits", icon: Globe2 },
  ];

  return (
    <div className="p-6 space-y-4 max-w-6xl">
      {/* Tabs + refresh */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                tab === id
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : "bg-white/5 text-[#94a3b8] border-[#1e2a3a] hover:text-white hover:bg-white/10"
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && <span className="text-xs text-[#64748b]">Updated {lastUpdate.toLocaleTimeString()}</span>}
          <button onClick={fetchData} className="p-2 bg-white/5 border border-[#1e2a3a] rounded-xl text-[#94a3b8] hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* HACKER NEWS */}
      {tab === "hackernews" && (
        <div className="space-y-2">
          {loading && !data?.hackernews.length && (
            <p className="text-sm text-[#64748b] p-4">Loading Hacker News…</p>
          )}
          {(data?.hackernews ?? []).map((s, i) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 hover:border-[#2d3f55] hover:bg-[#131f30] transition-colors group"
            >
              <span className="text-xl font-black text-[#1e2a3a] group-hover:text-[#2d3f55] w-6 text-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-orange-300 transition-colors leading-snug">
                  {s.title}
                </p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />{s.score} points
                  </span>
                  <span>{s.comments} comments</span>
                  <span>by {s.by}</span>
                  <span>{formatDistanceToNow(new Date(s.time * 1000), { addSuffix: true })}</span>
                </div>
              </div>
            </a>
          ))}
          <p className="text-xs text-[#64748b] pt-2">Data via Hacker News Firebase API · Top stories</p>
        </div>
      )}

      {/* GITHUB TRENDING */}
      {tab === "github" && (
        <div className="space-y-2">
          {loading && !data?.github.length && (
            <p className="text-sm text-[#64748b] p-4">Loading GitHub trending…</p>
          )}
          {(data?.github ?? []).map((r, i) => (
            <a
              key={i}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-3 hover:border-[#2d3f55] hover:bg-[#131f30] transition-colors group"
            >
              <span className="text-xl font-black text-[#1e2a3a] group-hover:text-[#2d3f55] w-6 text-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                    {r.author}/{r.name}
                  </p>
                  {r.language && (
                    <span className="flex items-center gap-1 text-[10px]">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: LANG_COLORS[r.language] ?? "#94a3b8" }}
                      />
                      <span className="text-[#64748b]">{r.language}</span>
                    </span>
                  )}
                </div>
                {r.description && (
                  <p className="text-xs text-[#64748b] mt-0.5 truncate">{r.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[11px] text-[#64748b]">
                  <span>⭐ {r.stars.toLocaleString()}</span>
                  <span className="text-green-400">+{r.addedStars} today</span>
                  <span>{r.forks.toLocaleString()} forks</span>
                </div>
              </div>
              <Code className="w-4 h-4 text-[#1e2a3a] group-hover:text-[#64748b] flex-shrink-0 mt-0.5" />
            </a>
          ))}
          {!loading && !data?.github.length && (
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-6 text-center text-[#64748b] text-sm">
              GitHub trending data temporarily unavailable
            </div>
          )}
          <p className="text-xs text-[#64748b] pt-2">Daily trending repositories · Stars gained today</p>
        </div>
      )}

      {/* WIKIPEDIA EDITS */}
      {tab === "wikipedia" && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <p className="text-xs text-green-400 font-semibold">Live edits — English Wikipedia</p>
          </div>
          {loading && !data?.wikipedia.length && (
            <p className="text-sm text-[#64748b] p-4">Loading Wikipedia edits…</p>
          )}
          {(data?.wikipedia ?? []).map((edit, i) => (
            <a
              key={i}
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(edit.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-xl border border-[#1e2a3a] bg-[#111827] px-4 py-2.5 hover:border-[#2d3f55] hover:bg-[#131f30] transition-colors group"
            >
              <Globe2 className="w-4 h-4 text-[#64748b] flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors truncate">
                  {edit.title}
                </p>
                {edit.comment && (
                  <p className="text-[11px] text-[#64748b] truncate mt-0.5">{edit.comment}</p>
                )}
                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#64748b]">
                  <span>by {edit.user}</span>
                  <span>{formatDistanceToNow(new Date(edit.timestamp), { addSuffix: true })}</span>
                </div>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${edit.delta >= 0 ? "text-green-400" : "text-red-400"}`}>
                {edit.delta >= 0 ? "+" : ""}{edit.delta}
              </span>
            </a>
          ))}
          <p className="text-xs text-[#64748b] pt-2">Data via MediaWiki API · Refreshes every 60s</p>
        </div>
      )}
    </div>
  );
}
