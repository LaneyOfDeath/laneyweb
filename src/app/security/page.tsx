import PageHeader from "@/components/PageHeader";
import SecurityDashboard from "@/components/SecurityDashboard";
import { Shield } from "lucide-react";

export default function SecurityPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Shield}
        title="Security"
        subtitle="CISA Known Exploited Vulnerabilities · Tor network statistics"
        iconColor="text-purple-400"
        live
      />
      <div className="flex-1 min-h-0">
        <SecurityDashboard />
      </div>
    </div>
  );
}
