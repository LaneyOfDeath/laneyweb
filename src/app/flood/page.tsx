import PageHeader from "@/components/PageHeader";
import FloodDashboard from "@/components/FloodDashboard";
import { Droplets } from "lucide-react";

export default function FloodPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Droplets}
        iconColor="text-blue-400"
        title="UK Flood Warnings"
        subtitle="Live Environment Agency alerts — severe warnings, flood warnings & alerts"
      />
      <div className="flex-1 min-h-0">
        <FloodDashboard />
      </div>
    </div>
  );
}
