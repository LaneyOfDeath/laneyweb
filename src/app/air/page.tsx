import PageHeader from "@/components/PageHeader";
import AirDashboard from "@/components/AirDashboard";
import { Wind } from "lucide-react";

export default function AirPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Wind}
        title="Air Quality"
        subtitle="Global air quality index, PM2.5, PM10, NO₂, ozone & more · search any city"
        iconColor="text-emerald-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <AirDashboard />
      </div>
    </div>
  );
}
