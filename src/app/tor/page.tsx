import PageHeader from "@/components/PageHeader";
import TorDashboard from "@/components/TorDashboard";
import { Shield } from "lucide-react";

export default function TorPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Shield}
        iconColor="text-purple-400"
        title="Tor Network"
        subtitle="Live relay stats, bandwidth & country breakdown — public metrics, no Tor browser needed"
        live={false}
      />
      <div className="flex-1 min-h-0">
        <TorDashboard />
      </div>
    </div>
  );
}
