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
  cyan: "shadow-[0_0_0_1px_rgba(6,182,212,0.2),0_4px_24px_rgba(6,182,212,0.08)]",
  blue: "shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_24px_rgba(59,130,246,0.08)]",
  green: "shadow-[0_0_0_1px_rgba(16,185,129,0.2),0_4px_24px_rgba(16,185,129,0.08)]",
  orange: "shadow-[0_0_0_1px_rgba(245,158,11,0.2),0_4px_24px_rgba(245,158,11,0.08)]",
  purple: "shadow-[0_0_0_1px_rgba(139,92,246,0.2),0_4px_24px_rgba(139,92,246,0.08)]",
  pink: "shadow-[0_0_0_1px_rgba(236,72,153,0.2),0_4px_24px_rgba(236,72,153,0.08)]",
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
        "rounded-xl p-4 border border-[#1e2a3a]",
        "bg-[#111827]",
        glowMap[glowColor]
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">{label}</p>
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
              trend === "neutral" && "text-[#64748b]"
            )}
          >
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"} {trendValue}
          </span>
        )}
        {sub && <span className="text-xs text-[#64748b]">{sub}</span>}
      </div>
    </div>
  );
}
