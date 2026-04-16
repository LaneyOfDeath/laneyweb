import PageHeader from "@/components/PageHeader";
import ShipsDashboard from "@/components/ShipsDashboard";
import { Ship } from "lucide-react";

export default function ShipsPage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Ship}
        iconColor="text-blue-400"
        title="Live Ship Tracking"
        subtitle="Real-time AIS vessel positions via AISStream WebSocket"
      />
      <div className="flex-1 min-h-0">
        <ShipsDashboard />
      </div>
    </div>
  );
}
