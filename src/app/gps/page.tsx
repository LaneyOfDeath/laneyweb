import { Metadata } from "next";
import { MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GPSMap from "@/components/GPSMap";

export const metadata: Metadata = {
  title: "GPS / Maps — LaneyWeb",
};

export default function GPSPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={MapPin}
        iconColor="text-green-400"
        title="GPS / Maps"
        subtitle="Interactive world map · Search, pin locations, DMS coords · OpenStreetMap & CARTO"
        live={false}
      />
      <div className="flex-1 min-h-0">
        <GPSMap />
      </div>
    </div>
  );
}
