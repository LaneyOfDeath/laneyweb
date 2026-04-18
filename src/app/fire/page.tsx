import PageHeader from "@/components/PageHeader";
import FireDashboard from "@/components/FireDashboard";
import { Flame } from "lucide-react";

export default function FirePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Flame}
        title="Global Fire Map"
        subtitle="Active wildfires worldwide from NASA EONET · VIIRS & MODIS satellite detection"
        iconColor="text-orange-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <FireDashboard />
      </div>
    </div>
  );
}
