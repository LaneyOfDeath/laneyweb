import { Metadata } from "next";
import { Plane } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import FlightsDashboard from "@/components/FlightsDashboard";

export const metadata: Metadata = {
  title: "Airport Flights — LaneyWeb",
};

export default function FlightsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Plane}
        iconColor="text-sky-400"
        title="Airport Flights"
        subtitle="Live departures & arrivals worldwide via AeroDataBox · Updates every 60s"
      />
      <div className="flex-1 overflow-auto">
        <FlightsDashboard />
      </div>
    </div>
  );
}
