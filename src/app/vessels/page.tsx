import PageHeader from "@/components/PageHeader";
import VesselsDashboard from "@/components/VesselsDashboard";
import { PlaneTakeoff } from "lucide-react";

export default function VesselsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={PlaneTakeoff}
        title="Vessels"
        subtitle="Live aircraft positions (ADS-B) · Marine vessel tracking (AIS)"
        iconColor="text-sky-400"
        live
      />
      <div className="flex-1 min-h-0">
        <VesselsDashboard />
      </div>
    </div>
  );
}
