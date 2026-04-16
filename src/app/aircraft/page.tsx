import { Metadata } from "next";
import { PlaneTakeoff } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import AircraftMap from "@/components/AircraftMap";

export const metadata: Metadata = {
  title: "Aircraft Tracking — LaneyWeb",
};

export default function AircraftPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={PlaneTakeoff}
        iconColor="text-sky-400"
        title="Aircraft Tracking"
        subtitle="Real-time ADS-B flight positions via OpenSky Network · Updates every 15s"
      />
      <div className="flex-1 min-h-0">
        <AircraftMap />
      </div>
    </div>
  );
}
