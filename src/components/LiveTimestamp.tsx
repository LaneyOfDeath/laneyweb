import PulseDot from "@/components/PulseDot";

export default function LiveTimestamp({ date }: { date: Date }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-[#60607a]">
      <PulseDot size="xs" />
      {date.toLocaleTimeString()}
    </span>
  );
}
