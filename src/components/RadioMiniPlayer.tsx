"use client";

import { Square, Volume2 } from "lucide-react";
import { useRadio } from "@/context/RadioContext";
import Link from "next/link";

export default function RadioMiniPlayer() {
  const { playing, nowPlaying, audioErr, stopStation } = useRadio();
  if (!playing) return null;

  return (
    <div className="fixed bottom-0 left-0 md:left-44 right-0 z-40 border-t border-violet-500/30 bg-[#0b0b14]/95 backdrop-blur-sm px-4 py-2 flex items-center gap-3">
      <div className="flex gap-px items-end h-4 flex-shrink-0">
        {[10, 6, 14, 5, 11].map((h, i) => (
          <div key={i} className="w-0.5 bg-violet-400 rounded-sm animate-pulse"
            style={{ height: h, animationDelay: `${i * 0.12}s` }} />
        ))}
      </div>
      <Volume2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
      <Link href="/radio" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
        <span className="text-xs font-semibold text-white mr-2">{playing.name}</span>
        {nowPlaying && !audioErr && (
          <span className="text-xs text-violet-300 truncate">♪ {nowPlaying}</span>
        )}
        {audioErr && <span className="text-xs text-red-400">Stream error</span>}
      </Link>
      <button
        onClick={stopStation}
        className="p-1.5 rounded-lg bg-white/10 text-violet-300 hover:text-white hover:bg-white/20 transition-colors flex-shrink-0"
        title="Stop"
      >
        <Square className="w-3 h-3" />
      </button>
    </div>
  );
}
