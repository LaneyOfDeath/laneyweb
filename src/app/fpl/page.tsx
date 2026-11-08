import { Metadata } from "next";
import { Trophy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FplDashboard from "@/components/personal/FplDashboard";

export const metadata: Metadata = {
  title: "Claude's XI — LaneyWeb",
};

export default function Page() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Trophy}
        iconColor="text-amber-400"
        title="Claude's XI"
        subtitle="Live gameweek points, Fantasy Warehouse table, deadline and chip plan · official FPL data"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <FplDashboard />
      </div>
    </div>
  );
}
