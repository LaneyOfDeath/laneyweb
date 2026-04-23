"use client";

import Link from "next/link";
import type { ElementType } from "react";
import useSWR from "swr";
import {
  AlertTriangle,
  CloudSun,
  Gauge,
  ShieldAlert,
  Train,
  Trophy,
  Zap,
} from "lucide-react";
import LiveBadge from "@/components/LiveBadge";
import LiveTimestamp from "@/components/LiveTimestamp";
import { SkeletonCard } from "@/components/Skeleton";

type AlertTone = "green" | "cyan" | "yellow" | "red";

interface AlertItem {
  title: string;
  message: string;
  meta: string;
  href: string;
  badge: string;
  tone: AlertTone;
  icon: ElementType;
  timestamp?: number;
}

interface TransportResponse {
  lines?: Array<{
    id: string;
    name: string;
    mode: string;
    statuses: Array<{
      severity: number;
      description: string;
      reason: string | null;
    }>;
  }>;
  timestamp?: number;
}

interface WeatherResponse {
  location?: { name: string };
  current?: {
    temp: number;
    label: string;
    windGusts: number;
    uvIndex: number;
  };
  airQuality?: {
    aqi: number;
    label: string;
  } | null;
  timestamp?: number;
}

interface PowerResponse {
  intensity?: {
    actual: number | null;
    forecast: number | null;
    index: string;
  } | null;
  mix?: Array<{
    fuel: string;
    perc: number;
  }>;
  timestamp?: number;
}

interface SportsResponse {
  league?: {
    name: string;
    flag: string;
  };
  data?: Array<{
    id: string;
    state: string;
    status: string;
    home: { name: string; score: string | null };
    away: { name: string; score: string | null };
    date: string;
  }>;
  timestamp?: number;
}

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

function intensityTone(index: string | null | undefined): AlertTone {
  if (!index) return "cyan";
  if (index === "low" || index === "very low") return "green";
  if (index === "moderate") return "cyan";
  if (index === "high") return "yellow";
  return "red";
}

function buildTransportAlert(data?: TransportResponse): AlertItem {
  const lines = data?.lines ?? [];
  const disruptions = lines.filter((line) =>
    line.statuses.some((status) => status.severity !== 10)
  );

  if (disruptions.length > 0) {
    const primary = disruptions[0];
    const status =
      primary.statuses.find((entry) => entry.severity !== 10) ?? primary.statuses[0];

    return {
      title: "Transport",
      message: `${disruptions.length} disruption${disruptions.length === 1 ? "" : "s"} across TfL`,
      meta: `${primary.name}: ${status?.description ?? "Service issue"}`,
      href: "/transport",
      badge: disruptions.length > 2 ? "Critical" : "Watch",
      tone: disruptions.length > 2 ? "red" : "yellow",
      icon: Train,
      timestamp: data?.timestamp,
    };
  }

  return {
    title: "Transport",
    message: "Good service across London lines",
    meta: `${lines.length} monitored lines reporting normal service`,
    href: "/transport",
    badge: "Stable",
    tone: "green",
    icon: Train,
    timestamp: data?.timestamp,
  };
}

function buildWeatherAlert(data?: WeatherResponse): AlertItem {
  const location = data?.location?.name ?? "London";
  const current = data?.current;

  if (!current) {
    return {
      title: "Weather",
      message: "Weather feed unavailable",
      meta: `Unable to load current conditions for ${location}`,
      href: "/weather",
      badge: "Retry",
      tone: "yellow",
      icon: CloudSun,
      timestamp: data?.timestamp,
    };
  }

  const hazardous =
    /Thunderstorm|Snow|Foggy/i.test(current.label) || current.windGusts >= 35;
  const breezy = current.windGusts >= 25;

  return {
    title: "Weather",
    message: `${location}: ${Math.round(current.temp)}C and ${current.label}`,
    meta: hazardous
      ? `Wind gusts ${Math.round(current.windGusts)} mph`
      : `UV ${Math.round(current.uvIndex)} | gusts ${Math.round(current.windGusts)} mph`,
    href: "/weather",
    badge: hazardous ? "Alert" : breezy ? "Breezy" : "Live",
    tone: hazardous ? "red" : breezy ? "yellow" : "cyan",
    icon: CloudSun,
    timestamp: data?.timestamp,
  };
}

function buildAirQualityAlert(data?: WeatherResponse): AlertItem {
  const location = data?.location?.name ?? "London";
  const airQuality = data?.airQuality;

  if (!airQuality) {
    return {
      title: "Air Quality",
      message: "Air quality feed unavailable",
      meta: `No AQI reading returned for ${location}`,
      href: "/weather",
      badge: "Retry",
      tone: "yellow",
      icon: ShieldAlert,
      timestamp: data?.timestamp,
    };
  }

  const tone =
    airQuality.aqi <= 40
      ? "green"
      : airQuality.aqi <= 60
        ? "cyan"
        : airQuality.aqi <= 80
          ? "yellow"
          : "red";

  return {
    title: "Air Quality",
    message: `${location} AQI ${Math.round(airQuality.aqi)} (${airQuality.label})`,
    meta:
      airQuality.aqi > 60
        ? "Conditions are elevated"
        : "Outdoor conditions are acceptable",
    href: "/weather",
    badge: airQuality.label,
    tone,
    icon: AlertTriangle,
    timestamp: data?.timestamp,
  };
}

function buildPowerAlert(data?: PowerResponse): AlertItem {
  const intensity = data?.intensity;
  const mix = data?.mix ?? [];
  const renewables = mix
    .filter((entry) => ["wind", "solar", "hydro", "biomass"].includes(entry.fuel))
    .reduce((sum, entry) => sum + entry.perc, 0);

  if (!intensity) {
    return {
      title: "Power Grid",
      message: "Carbon intensity feed unavailable",
      meta: "Unable to load national grid signal",
      href: "/power",
      badge: "Retry",
      tone: "yellow",
      icon: Zap,
      timestamp: data?.timestamp,
    };
  }

  const value = intensity.actual ?? intensity.forecast ?? 0;
  return {
    title: "Power Grid",
    message: `${value} gCO2/kWh across the UK grid`,
    meta: `${Math.round(renewables)}% renewable mix | ${intensity.index} intensity`,
    href: "/power",
    badge: intensity.index,
    tone: intensityTone(intensity.index),
    icon: Zap,
    timestamp: data?.timestamp,
  };
}

function buildSportsAlert(data?: SportsResponse): AlertItem {
  const leagueName = data?.league?.name ?? "Premier League";
  const events = data?.data ?? [];
  const liveEvent = events.find((event) => event.state === "in");
  const upcomingEvent = events.find((event) => event.state === "pre");

  if (liveEvent) {
    return {
      title: "Sports",
      message: `${liveEvent.home.name} ${liveEvent.home.score ?? "0"}-${liveEvent.away.score ?? "0"} ${liveEvent.away.name}`,
      meta: `${leagueName} | ${liveEvent.status}`,
      href: "/sports",
      badge: "Live",
      tone: "yellow",
      icon: Trophy,
      timestamp: data?.timestamp,
    };
  }

  if (upcomingEvent) {
    const kickoff = new Date(upcomingEvent.date);
    return {
      title: "Sports",
      message: `${upcomingEvent.home.name} vs ${upcomingEvent.away.name}`,
      meta: `${leagueName} | ${kickoff.toLocaleString([], {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      href: "/sports",
      badge: "Next",
      tone: "cyan",
      icon: Trophy,
      timestamp: data?.timestamp,
    };
  }

  return {
    title: "Sports",
    message: "No active scorelines right now",
    meta: `${leagueName} feed connected`,
    href: "/sports",
    badge: "Standby",
    tone: "green",
    icon: Trophy,
    timestamp: data?.timestamp,
  };
}

function AlertCard({ alert }: { alert: AlertItem }) {
  const Icon = alert.icon;
  const glow = {
    green: "shadow-[0_0_0_1px_rgba(74,222,128,0.18)]",
    cyan: "shadow-[0_0_0_1px_rgba(34,211,238,0.18)]",
    yellow: "shadow-[0_0_0_1px_rgba(250,204,21,0.18)]",
    red: "shadow-[0_0_0_1px_rgba(248,113,113,0.18)]",
  };
  const panel = {
    green: "from-green-400/12 to-emerald-400/5 border-green-400/20",
    cyan: "from-cyan-400/12 to-sky-400/5 border-cyan-400/20",
    yellow: "from-yellow-400/12 to-orange-400/5 border-yellow-400/20",
    red: "from-red-400/12 to-rose-400/5 border-red-400/20",
  };
  const iconColor = {
    green: "text-green-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-300",
    red: "text-red-400",
  };

  return (
    <Link
      href={alert.href}
      className={`group rounded-2xl border bg-gradient-to-br ${panel[alert.tone]} ${glow[alert.tone]} p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20">
            <Icon className={`h-4 w-4 ${iconColor[alert.tone]}`} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#60708f]">
              {alert.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {alert.message}
            </p>
          </div>
        </div>
        <LiveBadge label={alert.badge} color={alert.tone} />
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-xs leading-relaxed text-[#94a3b8]">
          {alert.meta}
        </p>
        {alert.timestamp ? <LiveTimestamp date={new Date(alert.timestamp)} /> : null}
      </div>
    </Link>
  );
}

export default function HomeAlertLayer() {
  const transport = useSWR<TransportResponse>("/api/transport", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });
  const weather = useSWR<WeatherResponse>("/api/weather?city=London", fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });
  const power = useSWR<PowerResponse>("/api/power", fetcher, {
    refreshInterval: 300_000,
    revalidateOnFocus: false,
  });
  const sports = useSWR<SportsResponse>(
    "/api/sports?league=epl&type=scores",
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
    }
  );

  const alerts = [
    buildTransportAlert(transport.data),
    buildWeatherAlert(weather.data),
    buildAirQualityAlert(weather.data),
    buildPowerAlert(power.data),
    buildSportsAlert(sports.data),
  ];

  const loadingCount = [transport, weather, power, sports].filter(
    (query) => !query.data && !query.error
  ).length;

  return (
    <section className="px-4 pt-4">
      <div className="rounded-2xl border border-[#1a2640] bg-[#081321]/90 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <Gauge className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#60708f]">
                Now Layer
              </p>
              <h2 className="text-lg font-black text-white">Homepage alerts</h2>
            </div>
          </div>
          <p className="text-xs text-[#64748b]">
            Priority signals pulled from live modules
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => (
            <AlertCard key={alert.title} alert={alert} />
          ))}
          {loadingCount > 0 &&
            Array.from({ length: Math.min(loadingCount, 2) }).map((_, index) => (
              <SkeletonCard key={`home-alert-skeleton-${index}`} h="h-36" />
            ))}
        </div>
      </div>
    </section>
  );
}
