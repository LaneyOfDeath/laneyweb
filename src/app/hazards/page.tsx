import PageHeader from "@/components/PageHeader";
import HazardsDashboard from "@/components/HazardsDashboard";
import { AlertTriangle } from "lucide-react";

export default function HazardsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={AlertTriangle}
        title="Hazards"
        subtitle="Earthquakes & volcanoes · Global wildfires · UK flood warnings"
        iconColor="text-orange-400"
        live
      />
      <div className="flex-1 min-h-0">
        <HazardsDashboard />
      </div>
    </div>
  );
}
