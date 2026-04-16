import { clsx } from "clsx";

interface LiveBadgeProps {
  label?: string;
  color?: "green" | "cyan" | "yellow" | "red";
}

export default function LiveBadge({ label = "Live", color = "green" }: LiveBadgeProps) {
  const colors = {
    green: "bg-green-400/10 border-green-400/20 text-green-400",
    cyan: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400",
    yellow: "bg-yellow-400/10 border-yellow-400/20 text-yellow-400",
    red: "bg-red-400/10 border-red-400/20 text-red-400",
  };
  const dotColors = {
    green: "bg-green-400",
    cyan: "bg-cyan-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400",
  };

  return (
    <span className={clsx("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider", colors[color])}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", dotColors[color])} />
        <span className={clsx("relative inline-flex rounded-full h-1.5 w-1.5", dotColors[color])} />
      </span>
      {label}
    </span>
  );
}
