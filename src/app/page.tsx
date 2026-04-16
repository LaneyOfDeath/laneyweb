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
  Ship,
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
    desc: "ISS live position, rocket launches & near-Earth asteroids",
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
    href: "/ships",
    label: "Ship Tracking",
    icon: Ship,
    color: "text-blue-300",
    bg: "bg-blue-300/10",
    border: "border-blue-300/20",
    desc: "Real-time AIS vessel positions via AISStream WebSocket",
    badge: "Live",
    badgeColor: "green" as const,
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
      <div
        className="px-6 pt-10 pb-8 border-b border-[#1e2a3a]"
        style={{
          background:
            "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(59,130,246,0.06) 50%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-10 h-10 text-cyan-400" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Laaney{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <p className="text-sm text-[#64748b] mt-0.5">
              Live OSINT dashboard — real-time feeds across 15 modules
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LiveBadge label="All systems live" color="green" />
          <span className="text-xs text-[#64748b]">
            Data refreshes automatically · No login required
          </span>
        </div>
      </div>

      {/* Module grid */}
      <div className="p-6">
        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest mb-4">
          Active modules
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {modules.map(
            ({ href, label, icon: Icon, color, bg, border, desc, badge, badgeColor }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col gap-3 p-5 rounded-xl border border-[#1e2a3a] bg-[#111827]
                           hover:border-[#2d3f55] hover:bg-[#131f30] transition-all duration-200
                           hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <LiveBadge label={badge} color={badgeColor} />
                </div>
                <div>
                  <h2 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
                    {label}
                  </h2>
                  <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{desc}</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#64748b] group-hover:text-cyan-400 transition-colors mt-auto">
                  <span>Open module</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 pb-8">
        <div className="rounded-xl border border-[#1e2a3a] bg-[#111827] p-4">
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
