import PageHeader from "@/components/PageHeader";
import CrimeDashboard from "@/components/CrimeDashboard";
import { AlertTriangle } from "lucide-react";

export default function CrimePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={AlertTriangle}
        title="Police Crime Data"
        subtitle="Street-level crime data by area and category · England & Wales · data.police.uk"
        iconColor="text-red-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <CrimeDashboard />
      </div>
    </div>
  );
}
