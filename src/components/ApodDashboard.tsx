"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RefreshCw } from "lucide-react";

interface ApodData {
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  date: string;
  copyright?: string;
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function parseDate(s: string) {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export default function ApodDashboard() {
  const [date, setDate] = useState(() => formatDate(new Date()));
  const [data, setData] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    setExpanded(false);
    fetch(`/api/apod?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [date]);

  function prev() {
    const d = parseDate(date);
    d.setDate(d.getDate() - 1);
    setDate(formatDate(d));
  }

  function next() {
    const d = parseDate(date);
    d.setDate(d.getDate() + 1);
    const today = new Date();
    if (d <= today) setDate(formatDate(d));
  }

  const isToday = date === formatDate(new Date());

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Date nav */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2a3a] flex-shrink-0">
        <button onClick={prev} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-white">{date}</span>
        <button onClick={next} disabled={isToday}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#94a3b8] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4" />
        </button>
        {!isToday && (
          <button onClick={() => setDate(formatDate(new Date()))}
            className="ml-1 px-3 py-1 rounded-lg bg-violet-500/20 text-violet-400 border border-violet-500/30 text-xs hover:bg-violet-500/30 transition-colors">
            Today
          </button>
        )}
        <span className="ml-auto text-xs text-[#64748b]">NASA Astronomy Picture of the Day</span>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 max-w-5xl mx-auto w-full">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Media */}
            <div className="rounded-xl overflow-hidden border border-[#1e2a3a] bg-black flex items-center justify-center"
              style={{ maxHeight: "60vh" }}>
              {data.media_type === "image" ? (
                <img
                  src={data.url}
                  alt={data.title}
                  className="w-full h-full object-contain"
                  style={{ maxHeight: "60vh" }}
                  loading="lazy"
                />
              ) : (
                <iframe
                  src={data.url}
                  title={data.title}
                  className="w-full aspect-video"
                  allowFullScreen
                />
              )}
            </div>

            {/* Info */}
            <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-bold text-white leading-snug">{data.title}</h2>
                {data.hdurl && data.media_type === "image" && (
                  <a href={data.hdurl} target="_blank" rel="noreferrer"
                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-medium text-white transition-colors">
                    <ExternalLink className="w-4 h-4" /> View in HD
                  </a>
                )}
              </div>
              {data.copyright && (
                <p className="text-[11px] text-[#64748b]">© {data.copyright}</p>
              )}
              <p className={`text-xs text-[#94a3b8] leading-relaxed ${!expanded ? "line-clamp-4" : ""}`}>
                {data.explanation}
              </p>
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors self-start">
                {expanded ? "Show less" : "Read more"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
