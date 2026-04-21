import PageHeader from "@/components/PageHeader";
import TransportDashboard from "@/components/TransportDashboard";
import { Train } from "lucide-react";

export default function TransportPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Train}
        title="UK Transport"
        subtitle="TfL live service status & National Rail live departures/arrivals"
        iconColor="text-sky-400"
        live
      />
      <div className="flex-1 overflow-y-auto">
        <TransportDashboard />
      </div>
    </div>
  );
}
