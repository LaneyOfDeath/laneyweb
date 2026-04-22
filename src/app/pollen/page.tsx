import { Metadata } from "next";
import { Flower2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import PollenDashboard from "@/components/PollenDashboard";

export const metadata: Metadata = {
  title: "Pollen Forecast — LaneyWeb",
};

export default function PollenPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Flower2}
        iconColor="text-green-400"
        title="Pollen Forecast"
        subtitle="Live pollen levels · Grass, birch, alder & more · 7-day outlook · Open-Meteo"
      />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <PollenDashboard />
      </div>
    </div>
  );
}
