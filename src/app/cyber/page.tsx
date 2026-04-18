import PageHeader from "@/components/PageHeader";
import CyberDashboard from "@/components/CyberDashboard";
import { Shield } from "lucide-react";

export default function CyberPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Shield}
        title="Cyber Security"
        subtitle="CISA Known Exploited Vulnerabilities · actively exploited CVEs tracked by US federal mandate"
        iconColor="text-red-400"
        live={false}
      />
      <div className="flex-1 overflow-y-auto">
        <CyberDashboard />
      </div>
    </div>
  );
}
