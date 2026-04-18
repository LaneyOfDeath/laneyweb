import Link from "next/link";
import {
  Car,
  Anchor,
  PlaneTakeoff,
  MapPin,
  Trophy,
  TrendingUp,
  Newspaper,
  Gamepad2,
  Globe,
  ArrowRight,
  CloudSun,
  Rocket,
  Mountain,
  Zap,
  Wifi,
  HelpCircle,
  Droplets,
  PoundSterling,
  Shield,
  Flame,
  Wind,
  Train,
  Radio,
} from "lucide-react";
import LiveBadge from "@/components/LiveBadge";

const modules = [
  {
    href: "/traffic",
    label: "Traffic",
    icon: Car,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    desc: "Live road congestion, incidents & travel times worldwide",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/marine",
    label: "Marine Traffic",
    icon: Anchor,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    desc: "AIS vessel positions, port activity & sea conditions",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/aircraft",
    label: "Aircraft Tracking",
    icon: PlaneTakeoff,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    desc: "Real-time flight positions via OpenSky Network ADS-B",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/gps",
    label: "GPS / Maps",
    icon: MapPin,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    desc: "Interactive world map with search, coordinates & layers",
    badge: "Live",
    badgeColor: "cyan" as const,
  },
  {
    href: "/sports",
    label: "Sports Stats",
    icon: Trophy,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    desc: "Scores, standings, fixtures & stats across all major sports",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/stocks",
    label: "Stock Market",
    icon: TrendingUp,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    desc: "Live indices, equities, forex & crypto market data",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/news",
    label: "Live News",
    icon: Newspaper,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    desc: "Global breaking news across all categories & regions",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/gaming",
    label: "Gaming Top 10",
    icon: Gamepad2,
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
    desc: "Worldwide game sales charts, Steam top players & releases",
    badge: "Updated",
    badgeColor: "yellow" as const,
  },
  {
    href: "/weather",
    label: "Weather",
    icon: CloudSun,
    color: "text-sky-300",
    bg: "bg-sky-300/10",
    border: "border-sky-300/20",
    desc: "Global conditions, 24h hourly, 7-day forecast & air quality index",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/space",
    label: "Space",
    icon: Rocket,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    desc: "ISS live position, rocket launches, near-Earth asteroids, space weather & NASA photo of the day",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/earth",
    label: "Earth Activity",
    icon: Mountain,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    desc: "Live seismic events, wildfires & volcanic activity worldwide",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/power",
    label: "Power Grid",
    icon: Zap,
    color: "text-lime-400",
    bg: "bg-lime-400/10",
    border: "border-lime-400/20",
    desc: "UK National Grid live fuel mix, carbon intensity & demand",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/internet",
    label: "Internet",
    icon: Wifi,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
    desc: "Wikipedia live edits, GitHub trending & internet pulse",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/flood",
    label: "Flood Warnings",
    icon: Droplets,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    desc: "UK Environment Agency live flood warnings, alerts & severe warnings",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/iss",
    label: "ISS Tracker",
    icon: Rocket,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    desc: "International Space Station live position, NASA video feed & crew list",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/prices",
    label: "UK Prices",
    icon: PoundSterling,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    desc: "UK fuel pump prices, live exchange rates & crypto in GBP",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/fire",
    label: "Global Fire Map",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    desc: "Active wildfires worldwide from NASA EONET · VIIRS & MODIS satellite detection",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/air",
    label: "Air Quality",
    icon: Wind,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    desc: "Global AQI, PM2.5, PM10, NO₂, ozone & more — search any city worldwide",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/transport",
    label: "UK Transport",
    icon: Train,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    border: "border-sky-400/20",
    desc: "London tube, overground, DLR, Elizabeth line & tram live service status",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/cyber",
    label: "Cyber Security",
    icon: Shield,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    desc: "CISA Known Exploited Vulnerabilities — actively exploited CVEs with remediation deadlines",
    badge: "KEV",
    badgeColor: "cyan" as const,
  },
  {
    href: "/radio",
    label: "Radio",
    icon: Radio,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
    desc: "Stream live radio from around the world — search by station name or genre",
    badge: "Live",
    badgeColor: "green" as const,
  },
  {
    href: "/tor",
    label: "Tor Network",
    icon: Shield,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
    desc: "Tor relay stats, bandwidth, top nodes & country breakdown — no Tor browser needed",
    badge: "Stats",
    badgeColor: "cyan" as const,
  },
  {
    href: "/quiz",
    label: "Trivia Quiz",
    icon: HelpCircle,
    color: "text-yellow-300",
    bg: "bg-yellow-300/10",
    border: "border-yellow-300/20",
    desc: "10-question trivia quiz — pick your category & difficulty",
    badge: "Fun",
    badgeColor: "yellow" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full">
      {/* Hero */}
      <div className="relative px-6 pt-4 pb-3 border-b border-[#1a2640] overflow-hidden">
        {/* Background glows */}
        <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full aurora"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-10 right-20 w-48 h-48 rounded-full aurora"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(40px)", animationDelay: "4s" }} />

        <div className="relative flex items-center justify-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(59,130,246,0.15))", border: "1px solid rgba(6,182,212,0.3)", boxShadow: "0 0 16px rgba(6,182,212,0.2)" }}>
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LaneyWeb
          </h1>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <LiveBadge label="All systems live" color="green" />
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            23 live modules
          </div>
          <span className="text-xs text-[#4a6080]">Data refreshes automatically · No login required</span>
        </div>
      </div>

      {/* Module grid */}
      <div className="p-4">
        <p className="text-xs font-semibold text-[#4a6080] uppercase tracking-widest mb-3">
          Active modules
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {modules.map(
            ({ href, label, icon: Icon, color, bg, border, desc, badge, badgeColor }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-2 p-4 rounded-xl border border-[#1a2640] bg-[#0d1e30]
                           hover:border-[#243352] transition-all duration-300 relative overflow-hidden"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
              >
                {/* Hover glow */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl ${bg}`}
                  style={{ filter: "blur(1px)" }} />

                <div className="relative flex items-start justify-between">
                  <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <LiveBadge label={badge} color={badgeColor} />
                </div>
                <div className="relative">
                  <h2 className={`font-semibold text-white text-xs transition-colors duration-200 group-hover:${color}`}>
                    {label}
                  </h2>
                  <p className="text-[11px] text-[#4a6080] mt-0.5 leading-relaxed group-hover:text-[#64748b] transition-colors line-clamp-2">{desc}</p>
                </div>
                <div className={`relative flex items-center gap-1 text-[10px] text-[#4a6080] group-hover:${color} transition-colors mt-auto`}>
                  <span>Open module</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 pb-8">
        <div className="rounded-2xl border border-[#1a2640] bg-[#0d1e30] p-4">
          <p className="text-xs text-[#64748b] leading-relaxed">
            <span className="text-[#94a3b8] font-medium">Data sources:</span> OpenSky Network
            (aircraft), OpenStreetMap (maps), Alpha Vantage (stocks), TheSportsDB (sports),
            NewsAPI (news), SteamSpy / IGDB (gaming), MarineTraffic (marine), TomTom (traffic),
            Open-Meteo (weather), The Space Devs / NASA (space), USGS (earthquakes), National Grid ESO (power),
            Wikimedia EventStream (internet). Free-tier APIs — upgrade any key in{" "}
            <code className="text-cyan-400 text-[11px]">.env.local</code> to remove rate limits.
          </p>
        </div>
      </div>
    </div>
  );
}
