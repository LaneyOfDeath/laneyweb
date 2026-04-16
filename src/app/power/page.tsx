import PageHeader from "@/components/PageHeader";
import PowerDashboard from "@/components/PowerDashboard";
import { Zap } from "lucide-react";

export default function PowerPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Zap}
        title="Power Grid"
        subtitle="UK National Grid live carbon intensity, generation mix & regional breakdown"
        iconColor="text-lime-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <PowerDashboard />
      </div>
    </div>
  );
}
