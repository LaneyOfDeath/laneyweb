import SpeedDashboard from "@/components/SpeedDashboard";
import PageHeader from "@/components/PageHeader";
import { Gauge } from "lucide-react";

export default function SpeedPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Gauge}
        iconColor="text-cyan-400"
        title="Speed Test"
        subtitle="Test your connection's ping, download and upload speed via Vercel edge"
        live={false}
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <SpeedDashboard />
      </div>
    </div>
  );
}
