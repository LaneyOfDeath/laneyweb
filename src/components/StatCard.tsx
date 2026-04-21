import { clsx } from "clsx";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  glowColor?: "cyan" | "blue" | "green" | "orange" | "purple" | "pink";
}

const glowMap = {
  cyan: "shadow-[0_0_0_1px_rgba(0,245,255,0.25),0_4px_24px_rgba(0,245,255,0.1)]",
  blue: "shadow-[0_0_0_1px_rgba(59,130,246,0.25),0_4px_24px_rgba(59,130,246,0.1)]",
  green: "shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_4px_24px_rgba(16,185,129,0.1)]",
  orange: "shadow-[0_0_0_1px_rgba(245,158,11,0.25),0_4px_24px_rgba(245,158,11,0.1)]",
  purple: "shadow-[0_0_0_1px_rgba(139,92,246,0.25),0_4px_24px_rgba(139,92,246,0.1)]",
  pink: "shadow-[0_0_0_1px_rgba(255,0,110,0.25),0_4px_24px_rgba(255,0,110,0.1)]",
};

export default function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconColor = "text-cyan-400",
  trend,
  trendValue,
  glowColor = "cyan",
}: StatCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl p-4 border border-[#1e1e2e]",
        "bg-[#0f0f17]",
        glowMap[glowColor]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#4a4a6a] uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon className={clsx("w-3.5 h-3.5", iconColor)} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-bold text-white tabular-nums">{value}</p>
      <div className="flex items-center gap-2 mt-1">
        {trend && trendValue && (
          <span
            className={clsx(
              "text-xs font-medium",
              trend === "up" && "text-green-400",
              trend === "down" && "text-red-400",
              trend === "neutral" && "text-[#4a4a6a]"
            )}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"} {trendValue}
          </span>
        )}
        {sub && <span className="text-xs text-[#4a4a6a]">{sub}</span>}
      </div>
    </div>
  );
}
