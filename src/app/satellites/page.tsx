import { Metadata } from "next";
import { Satellite } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SatelliteDashboard from "@/components/SatelliteDashboard";

export const metadata: Metadata = {
  title: "Satellite Tracker — LaneyWeb",
};

export default function SatellitePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Satellite}
        iconColor="text-violet-400"
        title="Satellite Tracker"
        subtitle="Live positions · Space Stations, Starlink, GPS · CelesTrak TLE · SGP4"
      />
      <div className="flex-1 min-h-0">
        <SatelliteDashboard />
      </div>
    </div>
  );
}
