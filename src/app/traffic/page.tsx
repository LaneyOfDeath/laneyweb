import { Metadata } from "next";
import { Car } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import TrafficMap from "@/components/TrafficMap";

export const metadata: Metadata = {
  title: "Traffic — LaaneyWeb",
};

export default function TrafficPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Car}
        iconColor="text-yellow-400"
        title="Traffic Tracking"
        subtitle="Live road incidents & flow · TomTom API (free tier) + OpenStreetMap"
      />
      <div className="flex-1 min-h-0">
        <TrafficMap />
      </div>
    </div>
  );
}
