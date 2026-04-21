import { clsx } from "clsx";

const colors = {
  green:  { ring: "bg-green-400",  dot: "bg-green-400"  },
  cyan:   { ring: "bg-cyan-400",   dot: "bg-cyan-400"   },
  yellow: { ring: "bg-yellow-400", dot: "bg-yellow-400" },
  red:    { ring: "bg-red-400",    dot: "bg-red-400"    },
};

export default function PulseDot({ color = "green", size = "sm" }: {
  color?: keyof typeof colors;
  size?: "xs" | "sm";
}) {
  const c = colors[color];
  const sz = size === "xs" ? "h-1.5 w-1.5" : "h-2 w-2";
  return (
    <span className={clsx("relative flex flex-shrink-0", sz)}>
      <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", c.ring)} />
      <span className={clsx("relative inline-flex rounded-full", sz, c.dot)} />
    </span>
  );
}
