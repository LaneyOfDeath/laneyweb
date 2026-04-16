import PageHeader from "@/components/PageHeader";
import PricesDashboard from "@/components/PricesDashboard";
import { TrendingUp } from "lucide-react";

export default function PricesPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={TrendingUp}
        iconColor="text-orange-400"
        title="UK Prices"
        subtitle="Fuel pump prices, exchange rates & crypto — no API key needed"
      />
      <div className="flex-1 min-h-0">
        <PricesDashboard />
      </div>
    </div>
  );
}
