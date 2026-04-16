import { Metadata } from "next";
import { Trophy } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SportsDashboard from "@/components/SportsDashboard";

export const metadata: Metadata = {
  title: "Sports Stats — LaneyWeb",
};

export default function SportsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Trophy}
        iconColor="text-orange-400"
        title="Sports Stats"
        subtitle="Standings, fixtures & results · TheSportsDB free tier · 9 leagues"
      />
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <SportsDashboard />
      </div>
    </div>
  );
}
