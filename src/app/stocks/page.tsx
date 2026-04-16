import { Metadata } from "next";
import { TrendingUp } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StocksDashboard from "@/components/StocksDashboard";

export const metadata: Metadata = {
  title: "Stock Market — LaaneyWeb",
};

export default function StocksPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={TrendingUp}
        iconColor="text-emerald-400"
        title="Stock Market"
        subtitle="Live indices, equities & crypto · Powered by Yahoo Finance · Updates every 60s"
      />
      <div className="flex-1 overflow-y-auto">
        <StocksDashboard />
      </div>
    </div>
  );
}
