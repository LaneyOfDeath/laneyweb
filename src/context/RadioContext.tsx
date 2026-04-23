"use client";

import { createContext, useContext, useRef, useState, useCallback, useEffect, ReactNode } from "react";

export interface RadioStation {
  id: string; name: string; url: string;
  favicon: string | null; tags: string[];
  country: string; countryCode: string;
  language: string; codec: string; bitrate: number; clicks: number;
}

interface RadioContextValue {
  playing: RadioStation | null;
  nowPlaying: string | null;
  audioErr: boolean;
  playStation: (s: RadioStation) => void;
  stopStation: () => void;
}

const RadioContext = createContext<RadioContextValue>({
  playing: null, nowPlaying: null, audioErr: false,
  playStation: () => {}, stopStation: () => {},
});

export function useRadio() { return useContext(RadioContext); }

export function RadioProvider({ children }: { children: ReactNode }) {
  const [playing, setPlaying] = useState<RadioStation | null>(null);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [audioErr, setAudioErr] = useState(false);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef     = useRef<any>(null);
  const errTimer   = useRef<ReturnType<typeof setTimeout>>(undefined);
  const npTimer    = useRef<ReturnType<typeof setInterval>>(undefined);
  const playingRef = useRef<RadioStation | null>(null);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  const fetchNowPlaying = useCallback(async (s: RadioStation) => {
    try {
      const res = await fetch(`/api/nowplaying?${new URLSearchParams({ stationId: s.id, url: s.url })}`);
      if (res.ok) { const d = await res.json(); setNowPlaying(d.nowPlaying ?? null); }
    } catch { /* silent */ }
  }, []);

  const stopStation = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    hlsRef.current?.destroy(); hlsRef.current = null;
    clearTimeout(errTimer.current); clearInterval(npTimer.current);
    setPlaying(null); setNowPlaying(null); setAudioErr(false);
  }, []);

  const playStation = useCallback((s: RadioStation) => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    hlsRef.current?.destroy(); hlsRef.current = null;
    clearTimeout(errTimer.current); clearInterval(npTimer.current);

    if (playingRef.current?.id === s.id) {
      setPlaying(null); setNowPlaying(null); setAudioErr(false); return;
    }

    setAudioErr(false);
    const audio = new Audio();
    const onCanPlay = () => { clearTimeout(errTimer.current); setAudioErr(false); };
    const onError   = () => { clearTimeout(errTimer.current); setAudioErr(true); };
    errTimer.current = setTimeout(() => setAudioErr(true), 10000);
    audio.addEventListener("canplay", onCanPlay);

    if (s.url.includes(".m3u8")) {
      import("hls.js").then(({ default: Hls }) => {
        if (Hls.isSupported()) {
          const hls = new Hls({ enableWorker: false });
          hls.loadSource(s.url); hls.attachMedia(audio);
          hls.on(Hls.Events.MANIFEST_PARSED, () => audio.play().catch(() => {}));
          hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) onError(); });
          hlsRef.current = hls;
        } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
          audio.src = s.url; audio.onerror = onError; audio.play().catch(() => {});
        } else { onError(); }
      });
    } else {
      audio.src = s.url; audio.onerror = onError; audio.play().catch(() => {});
    }

    audioRef.current = audio;
    setPlaying(s); setNowPlaying(null);
    fetchNowPlaying(s);
    npTimer.current = setInterval(() => fetchNowPlaying(s), 30000);
  }, [fetchNowPlaying]);

  useEffect(() => () => {
    audioRef.current?.pause();
    hlsRef.current?.destroy();
    clearInterval(npTimer.current);
  }, []);

  return (
    <RadioContext.Provider value={{ playing, nowPlaying, audioErr, playStation, stopStation }}>
      {children}
    </RadioContext.Provider>
  );
}
