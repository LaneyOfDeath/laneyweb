import PageHeader from "@/components/PageHeader";
import EarthDashboard from "@/components/EarthDashboard";
import { Mountain } from "lucide-react";

export default function EarthPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Mountain}
        title="Earth Activity"
        subtitle="Live seismic events (M2.5+), active volcanoes & geological data"
        iconColor="text-amber-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <EarthDashboard />
      </div>
    </div>
  );
}
