import PageHeader from "@/components/PageHeader";
import FinanceDashboard from "@/components/FinanceDashboard";
import { TrendingUp } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={TrendingUp}
        title="Finance"
        subtitle="Live stock market, indices & crypto · UK fuel, economy & exchange rates"
        iconColor="text-emerald-400"
        live
      />
      <div className="flex-1 min-h-0">
        <FinanceDashboard />
      </div>
    </div>
  );
}
